-- Test the send_verification_email function directly
SELECT send_verification_email(
  'test@example.com',
  'Test User',
  'test-token-123'
) as email_sent;

-- Check if the function exists
SELECT 
  proname as function_name,
  pronargs as arg_count
FROM pg_proc 
WHERE proname = 'send_verification_email';

-- Check trigger exists
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_member_created';

-- Check verification_logs table
SELECT * FROM verification_logs ORDER BY sent_at DESC LIMIT 5;