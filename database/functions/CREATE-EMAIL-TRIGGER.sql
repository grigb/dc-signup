-- Create trigger to automatically send verification email when new member is created
CREATE OR REPLACE FUNCTION trigger_send_verification_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email if member has a verification token and email is not verified
  IF NEW.verification_token IS NOT NULL AND NEW.email_verified = false THEN
    -- Call the send_verification_email function
    PERFORM send_verification_email(NEW.email, NEW.name, NEW.verification_token);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_member_created ON members;

-- Create the trigger
CREATE TRIGGER on_member_created
  AFTER INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_verification_email();