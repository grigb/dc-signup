# AWS SES Setup Guide for Email Verification

## Prerequisites
- AWS Account
- Supabase Project
- Domain for sending emails (optional but recommended)

## Step 1: AWS SES Configuration

### 1.1 Access AWS SES Console
1. Log in to AWS Console
2. Navigate to Amazon SES service
3. Select your preferred region (us-east-1 is recommended for better deliverability)

### 1.2 Verify Domain or Email
**Option A: Domain Verification (Recommended)**
1. Go to "Verified identities" → "Create identity"
2. Select "Domain"
3. Enter your domain (e.g., distributedcreatives.org)
4. Add the provided DNS records to your domain
5. Wait for verification (usually 24-48 hours)

**Option B: Email Verification (Quick Testing)**
1. Go to "Verified identities" → "Create identity"
2. Select "Email address"
3. Enter your email
4. Check inbox and click verification link

### 1.3 Move Out of Sandbox (Production)
1. By default, SES is in sandbox mode (can only send to verified emails)
2. Request production access: Configuration → Account dashboard → Request production access
3. Fill out the use case form explaining your email verification needs

### 1.4 Create IAM User for SES
1. Go to IAM service
2. Create new user: `dc-signup-ses-user`
3. Attach policy: `AmazonSESFullAccess` (or create custom policy for send-only)
4. Create access keys and save them securely

## Step 2: Supabase Setup

### 2.1 Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/migrations/ADD-EMAIL-CONFIRMATION.sql`
3. Run the migration

### 2.2 Deploy Edge Function
1. Install Supabase CLI if not already installed:
   ```bash
   brew install supabase/tap/supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref jgnyutkpxapaghderjmj
   ```

3. Set environment variables:
   ```bash
   supabase secrets set AWS_ACCESS_KEY_ID=your-access-key
   supabase secrets set AWS_SECRET_ACCESS_KEY=your-secret-key
   supabase secrets set AWS_REGION=us-east-1
   supabase secrets set SES_FROM_EMAIL=noreply@distributedcreatives.org
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy send-verification-email
   ```

### 2.3 Update RPC Function
In Supabase SQL Editor, update the `send_verification_email` function to call your Edge Function:

```sql
CREATE OR REPLACE FUNCTION send_verification_email(
  user_email TEXT,
  user_name TEXT,
  verification_token TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  response JSONB;
BEGIN
  -- Call the Edge Function
  SELECT content::jsonb INTO response
  FROM http((
    'POST',
    current_setting('app.settings.supabase_url') || '/functions/v1/send-verification-email',
    ARRAY[http_header('Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key'))],
    'application/json',
    json_build_object(
      'email', user_email,
      'name', user_name,
      'verificationToken', verification_token
    )::text
  )::http_request);
  
  RETURN (response->>'success')::boolean;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 3: Frontend Updates

The frontend code needs to handle the verification flow. See the updated `index.html` for:
1. Email verification page/route
2. Token validation
3. Success/error messaging

## Step 4: Testing

### 4.1 Test Email Sending
```bash
# Test the Edge Function directly
curl -X POST https://jgnyutkpxapaghderjmj.supabase.co/functions/v1/send-verification-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "verificationToken": "test123"
  }'
```

### 4.2 Monitor AWS SES
1. Check SES Console → Sending statistics
2. Monitor bounce/complaint rates
3. Set up SNS notifications for bounces/complaints

## Troubleshooting

### Common Issues:
1. **"Email address not verified"**: Sender email must be verified in SES
2. **"Sending rate exceeded"**: Check SES sending limits
3. **Emails not received**: Check spam folder, verify domain SPF/DKIM records
4. **Function timeout**: Increase Edge Function timeout in config

### SES Best Practices:
- Always handle bounces and complaints
- Use configuration sets for tracking
- Implement retry logic with exponential backoff
- Monitor reputation metrics

## Production Checklist:
- [ ] Domain verified in SES
- [ ] Moved out of SES sandbox
- [ ] SPF/DKIM/DMARC records configured
- [ ] Bounce/complaint handling implemented
- [ ] Rate limiting implemented
- [ ] Error monitoring set up
- [ ] Email templates tested across clients