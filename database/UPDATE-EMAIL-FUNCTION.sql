-- Update the send_verification_email function to call the Edge Function
CREATE OR REPLACE FUNCTION send_verification_email(
  user_email TEXT,
  user_name TEXT,
  verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  response JSON;
  edge_function_url TEXT;
BEGIN
  -- Construct the Edge Function URL
  edge_function_url := 'https://jgnyutkpxapaghderjmj.supabase.co/functions/v1/send-verification-email';
  
  -- Call the Edge Function using http extension
  SELECT content::json INTO response
  FROM http((
    'POST',
    edge_function_url,
    ARRAY[http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8'),
         http_header('Content-Type', 'application/json')],
    'application/json',
    json_build_object(
      'email', user_email,
      'name', user_name,
      'verificationToken', verification_token
    )::text
  )::http_request);
  
  -- Log the verification request
  INSERT INTO verification_logs (email, token, sent_at) 
  VALUES (user_email, verification_token, NOW())
  ON CONFLICT DO NOTHING;
  
  -- Check if the response indicates success
  RETURN (response->>'success')::boolean;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to send verification email: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;