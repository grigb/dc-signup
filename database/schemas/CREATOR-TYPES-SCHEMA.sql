-- Creator Types Database Schema
-- This allows you to manage creator types remotely through Supabase

-- Create creator_types table for hierarchical creator types
CREATE TABLE creator_types (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id VARCHAR(100) REFERENCES creator_types(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_creator_types_parent_id ON creator_types(parent_id);
CREATE INDEX idx_creator_types_sort_order ON creator_types(sort_order);
CREATE INDEX idx_creator_types_active ON creator_types(is_active);

-- Enable RLS
ALTER TABLE creator_types ENABLE ROW LEVEL SECURITY;

-- Allow public reads (for the signup form)
CREATE POLICY "Allow public reads" ON creator_types
  FOR SELECT USING (true);

-- Only allow authenticated users to modify (you can manage through Supabase dashboard)
CREATE POLICY "Allow authenticated inserts" ON creator_types
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated updates" ON creator_types
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated deletes" ON creator_types
  FOR DELETE TO authenticated USING (true);

-- Insert initial creator types data
-- Top-level categories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('traditional-arts', 'Traditional Arts', 'Classic artistic mediums and forms', NULL, 1),
('technical-creation', 'Technical Creation', 'Technology-focused creative work', NULL, 2),
('knowledge-creation', 'Knowledge Creation', 'Research, education, and thought leadership', NULL, 3),
('design-fields', 'Design Fields', 'Visual and functional design work', NULL, 4),
('content-creation', 'Content Creation', 'Digital content and media production', NULL, 5),
('web3-digital-assets', 'Web3 & Digital Assets', 'Blockchain and decentralized technologies', NULL, 6),
('other', 'Other', 'Creative work not listed above', NULL, 99);

-- Traditional Arts subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('visual-arts', 'Visual Arts', 'Painting, drawing, sculpture', 'traditional-arts', 1),
('music', 'Music', 'Composition, performance, production', 'traditional-arts', 2),
('writing', 'Writing', 'Fiction, non-fiction, poetry', 'traditional-arts', 3),
('photography', 'Photography', 'Digital and film photography', 'traditional-arts', 4),
('performance-acting', 'Performance/Acting', 'Theater, film, live performance', 'traditional-arts', 5);

-- Technical Creation subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('software-development', 'Software Development', 'Applications, systems, tools', 'technical-creation', 1),
('game-development', 'Game Development', 'Video games, interactive media', 'technical-creation', 2),
('web-development', 'Web Development', 'Websites, web applications', 'technical-creation', 3),
('engineering', 'Engineering', 'Hardware, systems, innovation', 'technical-creation', 4),
('data-science', 'Data Science', 'Analytics, visualization, AI/ML', 'technical-creation', 5);

-- Knowledge Creation subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('academic-research', 'Academic Research', 'Scientific, scholarly research', 'knowledge-creation', 1),
('scientific-writing', 'Scientific Writing', 'Research papers, technical writing', 'knowledge-creation', 2),
('education', 'Education', 'Teaching, curriculum, training', 'knowledge-creation', 3),
('journalism', 'Journalism', 'News, reporting, investigation', 'knowledge-creation', 4),
('thought-leadership', 'Thought Leadership', 'Industry insights, commentary', 'knowledge-creation', 5);

-- Design Fields subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('ux-ui-design', 'UX/UI Design', 'User experience, interface design', 'design-fields', 1),
('graphic-design', 'Graphic Design', 'Visual communication, branding', 'design-fields', 2),
('industrial-design', 'Industrial Design', 'Product design, manufacturing', 'design-fields', 3),
('architecture', 'Architecture', 'Building design, urban planning', 'design-fields', 4);

-- Content Creation subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('video', 'Video', 'Film, streaming, video production', 'content-creation', 1),
('podcasting', 'Podcasting', 'Audio content, broadcasting', 'content-creation', 2),
('voice-acting', 'Voice Acting', 'Narration, character voices', 'content-creation', 3),
('blogging', 'Blogging', 'Written online content', 'content-creation', 4),
('social-media', 'Social Media', 'Platform-specific content creation', 'content-creation', 5);

-- Web3 & Digital Assets subcategories
INSERT INTO creator_types (id, label, description, parent_id, sort_order) VALUES
('nft-creation', 'NFT Creation', 'Digital collectibles, crypto art', 'web3-digital-assets', 1),
('blockchain-development', 'Blockchain Development', 'Smart contracts, DApps', 'web3-digital-assets', 2),
('digital-collectibles', 'Digital Collectibles', 'Virtual items, game assets', 'web3-digital-assets', 3),
('decentralized-applications', 'Decentralized Applications', 'DeFi, DAOs, Web3 platforms', 'web3-digital-assets', 4);

-- Create a view for easy hierarchical queries
CREATE OR REPLACE VIEW creator_types_hierarchy AS
WITH RECURSIVE hierarchy AS (
  -- Base case: top-level categories
  SELECT 
    id,
    label,
    description,
    parent_id,
    sort_order,
    is_active,
    0 as level,
    ARRAY[sort_order] as path
  FROM creator_types 
  WHERE parent_id IS NULL AND is_active = true
  
  UNION ALL
  
  -- Recursive case: subcategories
  SELECT 
    ct.id,
    ct.label,
    ct.description,
    ct.parent_id,
    ct.sort_order,
    ct.is_active,
    h.level + 1,
    h.path || ct.sort_order
  FROM creator_types ct
  JOIN hierarchy h ON ct.parent_id = h.id
  WHERE ct.is_active = true
)
SELECT 
  id,
  label,
  description,
  parent_id,
  sort_order,
  level,
  path
FROM hierarchy
ORDER BY path;

-- Grant access to the view
GRANT SELECT ON creator_types_hierarchy TO anon;
GRANT SELECT ON creator_types_hierarchy TO authenticated;

-- Create function to get creator types as JSON (for the app)
CREATE OR REPLACE FUNCTION get_creator_types_json()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH RECURSIVE hierarchy AS (
    -- Get top-level categories
    SELECT 
      id,
      label,
      description,
      parent_id,
      sort_order,
      jsonb_build_object(
        'id', id,
        'label', label,
        'description', description
      ) as item_json
    FROM creator_types 
    WHERE parent_id IS NULL AND is_active = true
    
    UNION ALL
    
    -- Get subcategories
    SELECT 
      ct.id,
      ct.label,
      ct.description,
      ct.parent_id,
      ct.sort_order,
      jsonb_build_object(
        'id', ct.id,
        'label', ct.label,
        'description', ct.description
      ) as item_json
    FROM creator_types ct
    JOIN hierarchy h ON ct.parent_id = h.id
    WHERE ct.is_active = true
  ),
  -- Build nested structure
  nested AS (
    SELECT 
      parent_cats.item_json || 
      CASE 
        WHEN child_items.children IS NOT NULL 
        THEN jsonb_build_object('children', child_items.children)
        ELSE '{}'::jsonb
      END as category_json
    FROM (
      SELECT * FROM hierarchy WHERE parent_id IS NULL
      ORDER BY sort_order
    ) parent_cats
    LEFT JOIN (
      SELECT 
        parent_id,
        jsonb_agg(item_json ORDER BY sort_order) as children
      FROM hierarchy 
      WHERE parent_id IS NOT NULL
      GROUP BY parent_id
    ) child_items ON parent_cats.id = child_items.parent_id
  )
  SELECT jsonb_build_object(
    'version', '1.0',
    'lastUpdated', NOW()::date,
    'creatorTypes', jsonb_agg(category_json ORDER BY (category_json->>'id'))
  ) INTO result
  FROM nested;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_creator_types_json() TO anon;
GRANT EXECUTE ON FUNCTION get_creator_types_json() TO authenticated;