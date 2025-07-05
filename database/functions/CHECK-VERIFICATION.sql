-- Check if the test verification worked
SELECT 
  id,
  email,
  name,
  email_verified,
  verification_token,
  verified_at
FROM members 
WHERE verification_token = 'test-correct-region-1751306749'
  OR email = 'grigbilham@gmail.com'
ORDER BY created_at DESC
LIMIT 5;

-- Check verification logs
SELECT * FROM verification_logs 
WHERE token = 'test-correct-region-1751306749'
ORDER BY sent_at DESC;