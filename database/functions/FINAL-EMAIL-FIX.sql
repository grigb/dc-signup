-- Enable http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Update the send_verification_email function to be more resilient
CREATE OR REPLACE FUNCTION send_verification_email(
  user_email TEXT,
  user_name TEXT,
  verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  response JSON;
  http_status INTEGER;
  edge_function_url TEXT;
  auth_token TEXT;
BEGIN
  -- Always log the attempt first
  INSERT INTO verification_logs (email, token, sent_at) 
  VALUES (user_email, verification_token, NOW())
  ON CONFLICT DO NOTHING;
  
  -- Construct the Edge Function URL
  edge_function_url := 'https://jgnyutkpxapaghderjmj.supabase.co/functions/v1/send-verification-email';
  auth_token := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8';
  
  -- Try to call the Edge Function
  BEGIN
    -- Check if http extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
      -- Make the HTTP request
      SELECT 
        status,
        content::json 
      INTO 
        http_status,
        response
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
      
      -- Log the response
      RAISE NOTICE 'Edge Function response status: %, content: %', http_status, response;
      
      -- Return true if status is 200
      RETURN http_status = 200;
    ELSE
      -- HTTP extension not available
      RAISE WARNING 'HTTP extension not available, email logged but not sent';
      RETURN true; -- Still return true so signup completes
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the signup
      RAISE WARNING 'Failed to send verification email: %', SQLERRM;
      -- Still return true so signup completes
      RETURN true;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT send_verification_email('test@example.com', 'Test User', 'test-token-123');