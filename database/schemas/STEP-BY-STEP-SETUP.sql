-- MEMBERS DATABASE SETUP - Complete setup for DC signup system
-- Run this entire script in Supabase SQL Editor

-- STEP 1: Create members table with ALL columns from the start
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  creator_types JSONB DEFAULT '[]'::jsonb,
  country VARCHAR(100),
  member_bio TEXT,
  member_quote TEXT,
  allow_name_display BOOLEAN DEFAULT false,
  allow_creator_type_display BOOLEAN DEFAULT false,
  allow_comments_display BOOLEAN DEFAULT false,
  include_in_genesis_group BOOLEAN DEFAULT false,
  device_id VARCHAR(100),
  referral_source VARCHAR(100) DEFAULT 'conference',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_source VARCHAR(50) DEFAULT 'web'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
CREATE INDEX IF NOT EXISTS idx_members_device_id ON members(device_id);
CREATE INDEX IF NOT EXISTS idx_members_allow_name_display ON members(allow_name_display);
CREATE INDEX IF NOT EXISTS idx_members_include_in_genesis_group ON members(include_in_genesis_group);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policies for members table
DROP POLICY IF EXISTS "Allow public inserts" ON members;
DROP POLICY IF EXISTS "Allow public selects" ON members;

CREATE POLICY "Allow public inserts" ON members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public selects" ON members
  FOR SELECT USING (true);

-- STEP 2: Create creator_types table
CREATE TABLE IF NOT EXISTS creator_types (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id VARCHAR(100) REFERENCES creator_types(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for creator_types
ALTER TABLE creator_types ENABLE ROW LEVEL SECURITY;

-- Create policies for creator_types
DROP POLICY IF EXISTS "Allow public reads" ON creator_types;
CREATE POLICY "Allow public reads" ON creator_types FOR SELECT USING (true);

-- STEP 3: Insert creator types data
DELETE FROM creator_types;

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

-- STEP 4: Create the function (must be after creator_types table exists)
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

-- STEP 5: Create views
CREATE OR REPLACE VIEW genesis_member_showcase AS
SELECT 
  id,
  CASE 
    WHEN allow_name_display = true THEN name 
    ELSE 'Anonymous Member' 
  END as display_name,
  CASE 
    WHEN allow_creator_type_display = true THEN creator_types 
    ELSE NULL 
  END as display_creator_types,
  CASE 
    WHEN allow_comments_display = true THEN member_bio 
    ELSE NULL 
  END as display_bio,
  country,
  created_at
FROM members 
WHERE include_in_genesis_group = true
ORDER BY created_at ASC;

-- Grant access to the view
GRANT SELECT ON genesis_member_showcase TO anon;
GRANT SELECT ON genesis_member_showcase TO authenticated;

-- Create aggregation view for member stats
CREATE OR REPLACE VIEW member_stats AS
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN include_in_genesis_group = true THEN 1 END) as genesis_group_members,
  COUNT(CASE WHEN allow_name_display = true THEN 1 END) as members_showing_names,
  COUNT(CASE WHEN member_bio IS NOT NULL AND allow_comments_display = true THEN 1 END) as members_with_bios,
  COUNT(DISTINCT country) as countries_represented
FROM members;

-- Grant access to stats view
GRANT SELECT ON member_stats TO anon;
GRANT SELECT ON member_stats TO authenticated;

-- STEP 6: Insert test record
INSERT INTO members (
  name, 
  email, 
  creator_types, 
  country,
  member_bio,
  allow_name_display,
  allow_creator_type_display, 
  allow_comments_display,
  include_in_genesis_group,
  device_id,
  referral_source,
  sync_source
) VALUES (
  'Genesis Test Member',
  'genesis-test@distributedcreatives.org',
  '["technical-creation", "design-fields"]'::jsonb,
  'United States',
  'This is a test record for the Genesis group setup.',
  true,
  true,
  true,
  true,
  'setup-device',
  'database-setup',
  'setup-script'
);

-- STEP 7: Test everything
SELECT 'Testing creator types function...' as test_step;
SELECT get_creator_types_json();

SELECT 'Testing member stats...' as test_step;
SELECT * FROM member_stats;

SELECT 'Testing Genesis showcase...' as test_step;
SELECT * FROM genesis_member_showcase;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Members database setup complete!';
  RAISE NOTICE '✅ members table created with Genesis group fields';
  RAISE NOTICE '✅ creator_types table created with hierarchical data';
  RAISE NOTICE '✅ Views created for Genesis member showcase';
  RAISE NOTICE '✅ Function created for JSON creator types';
  RAISE NOTICE '✅ Test record inserted in Genesis group';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to test v4-enhanced/index.html!';
  RAISE NOTICE 'Note: Frontend will use "members" table instead of "signups"';
END $$;