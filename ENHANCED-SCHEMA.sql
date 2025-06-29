-- Enhanced schema for v4-enhanced version
-- Run this in Supabase SQL Editor to add new privacy fields

-- Add privacy control columns to existing signups table
ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_name_display BOOLEAN DEFAULT false;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_creator_type_display BOOLEAN DEFAULT false;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS allow_comments_display BOOLEAN DEFAULT false;
ALTER TABLE signups ADD COLUMN IF NOT EXISTS include_in_first_hundred BOOLEAN DEFAULT false;

-- Add member bio column
ALTER TABLE signups ADD COLUMN IF NOT EXISTS member_bio TEXT;

-- Update the existing first_150_optin column name for consistency (if it exists)
-- ALTER TABLE signups RENAME COLUMN first_150_optin TO include_in_first_hundred;

-- Add indexes for website display queries
CREATE INDEX IF NOT EXISTS idx_signups_allow_name_display ON signups(allow_name_display);
CREATE INDEX IF NOT EXISTS idx_signups_include_in_first_hundred ON signups(include_in_first_hundred);

-- Update RLS policies to allow the new fields
DROP POLICY IF EXISTS "Allow public inserts" ON signups;
CREATE POLICY "Allow public inserts" ON signups
  FOR INSERT WITH CHECK (true);

-- Optional: Create a view for website display data (respects privacy settings)
CREATE OR REPLACE VIEW public_member_showcase AS
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
FROM signups 
WHERE include_in_first_hundred = true
ORDER BY created_at ASC;

-- Grant access to the view
GRANT SELECT ON public_member_showcase TO anon;
GRANT SELECT ON public_member_showcase TO authenticated;

-- Optional: Create aggregation view for public stats
CREATE OR REPLACE VIEW public_stats AS
SELECT 
  COUNT(*) as total_members,
  COUNT(CASE WHEN include_in_first_hundred = true THEN 1 END) as first_hundred_members,
  COUNT(CASE WHEN allow_name_display = true THEN 1 END) as members_showing_names,
  COUNT(CASE WHEN member_bio IS NOT NULL AND allow_comments_display = true THEN 1 END) as members_with_bios,
  jsonb_object_agg(
    CASE 
      WHEN country IS NOT NULL THEN country 
      ELSE 'Unknown' 
    END, 
    country_count
  ) as members_by_country
FROM (
  SELECT 
    country,
    COUNT(*) as country_count
  FROM signups 
  GROUP BY country
) country_stats;

-- Grant access to stats view
GRANT SELECT ON public_stats TO anon;
GRANT SELECT ON public_stats TO authenticated;