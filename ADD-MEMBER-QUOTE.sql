-- Add member_quote field to existing members table
-- Run this if you already have the members table set up

ALTER TABLE members ADD COLUMN IF NOT EXISTS member_quote TEXT;

-- Update the view to include the new column
DROP VIEW IF EXISTS public_members;
CREATE VIEW public_members AS
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
    created_at
FROM members
WHERE allow_name_display = true OR include_in_genesis_group = true;