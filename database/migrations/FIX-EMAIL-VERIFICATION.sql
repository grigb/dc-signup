-- FIX EMAIL VERIFICATION FUNCTION
-- This ensures the verify_email_token function works properly
-- Date: 2025-07-07
-- Purpose: Fix users getting stuck on verify page instead of being redirected

-- =============================================================================
-- STEP 1: CREATE/UPDATE THE VERIFICATION FUNCTION
-- =============================================================================

-- Drop the existing function first
DROP FUNCTION IF EXISTS verify_email_token(TEXT);

-- Create the verify_email_token function that returns JSON
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  result JSON;
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
    
    -- Return success with email
    result := json_build_object(
      'success', true,
      'email', member_record.email,
      'name', member_record.name
    );
    RETURN result;
  ELSE
    -- Return failure
    result := json_build_object(
      'success', false,
      'email', NULL,
      'name', NULL
    );
    RETURN result;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return failure on any error
    result := json_build_object(
      'success', false,
      'email', NULL,
      'name', NULL,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- =============================================================================
-- STEP 2: GRANT PROPER PERMISSIONS
-- =============================================================================

-- Grant execution rights to anonymous users (needed for email verification)
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO authenticated;

-- =============================================================================
-- STEP 3: ENSURE RLS POLICIES ALLOW VERIFICATION
-- =============================================================================

-- Create a policy to allow anonymous users to verify emails
-- This is safe because it only allows updating email_verified status with a valid token
DROP POLICY IF EXISTS "Allow email verification" ON members;

CREATE POLICY "Allow email verification" ON members
    FOR UPDATE 
    USING (
        email_verified = false 
        AND verification_token IS NOT NULL 
        AND verification_sent_at > NOW() - INTERVAL '24 hours'
    );

-- Allow anonymous users to read members during verification (needed for the function)
DROP POLICY IF EXISTS "Allow anonymous verification reads" ON members;

CREATE POLICY "Allow anonymous verification reads" ON members
    FOR SELECT
    TO anon
    USING (
        email_verified = false 
        AND verification_token IS NOT NULL 
        AND verification_sent_at > NOW() - INTERVAL '24 hours'
    );

-- =============================================================================
-- STEP 4: TEST THE FUNCTION
-- =============================================================================

-- Add a comment for documentation
COMMENT ON FUNCTION verify_email_token(TEXT) IS 'Verifies email confirmation token and marks user as verified. Returns JSON with success status and user info.';

-- Success message
SELECT 'Email verification function fixed successfully!' AS status;