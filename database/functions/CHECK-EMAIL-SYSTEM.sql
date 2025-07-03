-- Check if recent signups were saved
SELECT 
  id,
  name,
  email,
  email_verified,
  verification_token,
  verification_sent_at,
  created_at
FROM members 
WHERE email LIKE 'test-%@example.com'
ORDER BY created_at DESC 
LIMIT 5;

-- Check verification logs
SELECT 
  id,
  email,
  token,
  sent_at
FROM verification_logs 
ORDER BY sent_at DESC 
LIMIT 5;

-- Check if http extension is installed
SELECT * FROM pg_extension WHERE extname = 'http';

-- Check Edge Function logs in Supabase Dashboard:
-- https://supabase.com/dashboard/project/jgnyutkpxapaghderjmj/functions/send-verification-email/logs