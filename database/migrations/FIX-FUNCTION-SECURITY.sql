-- FIX FUNCTION SECURITY - Set immutable search_path for security
-- Run this in Supabase SQL Editor to fix the mutable search_path issue

-- Fix the get_creator_types_json function with proper search_path
CREATE OR REPLACE FUNCTION public.get_creator_types_json()
RETURNS JSON
SET search_path = public
AS $$
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
      ) ORDER BY ct.sort_order  -- Ensures "Other" appears at bottom with sort_order 7
    )
  ) INTO result
  FROM creator_types ct
  WHERE ct.parent_id IS NULL 
    AND ct.is_active = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix the generate_verification_token function if it exists
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS TEXT
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix the verify_email_token function if it exists
CREATE OR REPLACE FUNCTION public.verify_email_token(token TEXT)
RETURNS BOOLEAN
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
BEGIN
  -- Find member with this token
  SELECT * INTO member_record 
  FROM members 
  WHERE verification_token = token 
    AND email_verified = false
    AND verification_sent_at > NOW() - INTERVAL '24 hours'; -- Token expires in 24 hours
  
  IF member_record.id IS NOT NULL THEN
    -- Mark email as verified
    UPDATE members 
    SET email_verified = true, 
        verified_at = NOW(),
        verification_token = NULL
    WHERE id = member_record.id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the "Other" category sort order to appear at bottom
UPDATE creator_types 
SET sort_order = 7 
WHERE id = 'other';

-- Verify the functions now have proper security settings
SELECT 
  proname as function_name,
  proconfig as configuration
FROM pg_proc 
WHERE proname IN ('get_creator_types_json', 'generate_verification_token', 'verify_email_token')
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

COMMENT ON FUNCTION public.get_creator_types_json IS 'Returns creator types as JSON with fixed search_path for security';
COMMENT ON FUNCTION public.generate_verification_token IS 'Generates secure verification token with fixed search_path';
COMMENT ON FUNCTION public.verify_email_token IS 'Verifies email confirmation token with fixed search_path';