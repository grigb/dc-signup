-- Update the verify_email_token function to return the member's email
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS JSON AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;