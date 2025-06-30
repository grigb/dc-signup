-- FIX OTHER CATEGORY ORDER - Move "Other" to bottom of list
-- Run this in Supabase SQL Editor

-- Update the sort order to move "Other" to the bottom (sort_order 7)
UPDATE creator_types 
SET sort_order = 7 
WHERE id = 'other';

-- Also update the get_creator_types_json function to ensure proper ordering
CREATE OR REPLACE FUNCTION get_creator_types_json()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'version', '1.0',
    'lastUpdated', CURRENT_DATE::text,
    'creatorTypes', json_agg(
      json_build_object(
        'id', ct.id,
        'label', ct.label, 
        'description', ct.description,
        'children', (
          SELECT json_agg(
            json_build_object(
              'id', child.id,
              'label', child.label,
              'description', child.description
            ) ORDER BY child.sort_order
          )
          FROM creator_types child 
          WHERE child.parent_id = ct.id 
            AND child.is_active = true
        )
      ) ORDER BY ct.sort_order  -- This ensures proper ordering including "Other" at the bottom
    )
  ) INTO result
  FROM creator_types ct
  WHERE ct.parent_id IS NULL 
    AND ct.is_active = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the ordering with a quick query
SELECT id, label, sort_order 
FROM creator_types 
WHERE parent_id IS NULL 
ORDER BY sort_order;