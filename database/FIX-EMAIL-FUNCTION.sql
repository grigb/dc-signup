-- Enable http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Update the send_verification_email function to handle errors better
CREATE OR REPLACE FUNCTION send_verification_email(
  user_email TEXT,
  user_name TEXT,
  verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  response JSON;
  edge_function_url TEXT;
  auth_token TEXT;
BEGIN
  -- Log the attempt
  RAISE NOTICE 'Attempting to send verification email to %', user_email;
  
  -- For now, just log to verification_logs since Edge Function has issues
  INSERT INTO verification_logs (email, token, sent_at) 
  VALUES (user_email, verification_token, NOW())
  ON CONFLICT DO NOTHING;
  
  -- Try to call Edge Function but don't fail if it errors
  BEGIN
    -- Construct the Edge Function URL
    edge_function_url := 'https://jgnyutkpxapaghderjmj.supabase.co/functions/v1/send-verification-email';
    auth_token := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8';
    
    -- Only try http call if extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
      SELECT content::json INTO response
      FROM http((
        'POST',
        edge_function_url,
        ARRAY[
          http_header('Authorization', 'Bearer ' || auth_token),
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        json_build_object(
          'email', user_email,
          'name', user_name,
          'verificationToken', verification_token
        )::text
      )::http_request);
      
      RAISE NOTICE 'Edge Function response: %', response;
    ELSE
      RAISE NOTICE 'HTTP extension not available, email logged but not sent';
    END IF;
    
    RETURN true;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the signup
      RAISE WARNING 'Failed to call Edge Function: %', SQLERRM;
      -- Still return true so signup completes
      RETURN true;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;