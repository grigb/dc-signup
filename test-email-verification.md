# Testing Email Verification

## Option 1: Test via the Live Site
1. Go to https://signup.distributedcreatives.org
2. Fill out the form with your email
3. Submit the form
4. Check your email for verification link
5. Click the link to verify

## Option 2: Test Locally
1. Go to http://localhost:4100
2. Sign up with your email
3. Check email and click verification link

## Option 3: Test the Edge Function Directly
```bash
curl -X POST https://jgnyutkpxapaghderjmj.supabase.co/functions/v1/send-verification-email \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Test User",
    "verificationToken": "test-token-123"
  }'
```

## Important Notes:
- **AWS SES Sandbox**: You can only send to verified email addresses until AWS approves production access
- **Verify your test email first**: In AWS SES, add your test email as a verified identity
- **Check spam folder**: Verification emails might go to spam initially

## To Monitor:
1. **Supabase Logs**: Check Edge Function logs in Supabase dashboard
2. **AWS SES Console**: Monitor sending statistics
3. **Database**: Check `verification_logs` table for sent emails
4. **Browser Console**: Check for any JavaScript errors during signup