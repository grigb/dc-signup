-- ADD EMAIL CONFIRMATION SYSTEM
-- Run this in Supabase SQL Editor to add email verification

-- Add email verification columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification token
CREATE INDEX IF NOT EXISTS idx_members_verification_token ON members(verification_token);

-- Create function to generate verification token
CREATE OR REPLACE FUNCTION generate_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send email confirmation (placeholder for webhook)
CREATE OR REPLACE FUNCTION send_verification_email(
  user_email TEXT,
  user_name TEXT,
  verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  webhook_url TEXT := 'https://api.emailjs.com/api/v1.0/email/send'; -- Replace with your email service
BEGIN
  -- This is a placeholder function that would integrate with your email service
  -- For production, you'd use a webhook to trigger actual email sending
  
  -- Log the verification request (for testing)
  INSERT INTO verification_logs (email, token, sent_at) 
  VALUES (user_email, verification_token, NOW())
  ON CONFLICT DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create verification logs table for tracking
CREATE TABLE IF NOT EXISTS verification_logs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for verification_logs
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON verification_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public selects" ON verification_logs FOR SELECT USING (true);

-- Create function to verify email token
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS BOOLEAN AS $$
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

-- Create view for Genesis members (only verified emails)
CREATE OR REPLACE VIEW genesis_members AS
SELECT 
  id,
  name,
  email,
  creator_types,
  country,
  member_bio,
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
ALTER VIEW genesis_members SET (security_barrier = true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON genesis_members TO anon;
GRANT EXECUTE ON FUNCTION generate_verification_token() TO anon;
GRANT EXECUTE ON FUNCTION send_verification_email(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;

-- Example of verification URL format:
-- https://signup.distributedcreatives.org/verify?token=abc123...

COMMENT ON TABLE verification_logs IS 'Tracks email verification attempts and engagement';
COMMENT ON FUNCTION verify_email_token IS 'Verifies email confirmation token and marks user as verified';
COMMENT ON VIEW genesis_members IS 'Public view of verified Genesis Members for website display';