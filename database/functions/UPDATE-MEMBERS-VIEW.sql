-- Update the view to be just "verified_members" instead of "genesis_members"
DROP VIEW IF EXISTS genesis_members CASCADE;

-- Create new view for verified members
CREATE OR REPLACE VIEW verified_members AS
SELECT 
  id,
  name,
  email,
  creator_types,
  country,
  member_bio,
  member_quote,
  allow_name_display,
  allow_creator_type_display,
  allow_comments_display,
  include_in_genesis_group,
  created_at,
  verified_at
FROM members 
WHERE email_verified = true 
  AND include_in_genesis_group = true
ORDER BY verified_at ASC;

-- Enable RLS for the view
ALTER VIEW verified_members SET (security_barrier = true);

-- Grant permissions
GRANT SELECT ON verified_members TO anon;

-- Add comment
COMMENT ON VIEW verified_members IS 'Public view of verified Distributed Creatives members';