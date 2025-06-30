# AWS SES Identity Setup - Step by Step

## Step 1: Access AWS SES Console

1. Log into [AWS Console](https://console.aws.amazon.com)
2. Search for "SES" in the top search bar
3. Click on "Amazon Simple Email Service"
4. Make sure you're in the correct region (top-right corner)
   - Recommended: `US East (N. Virginia)` or `EU (Ireland)`

## Step 2: Create New Identity

### Option A: Domain Identity (Recommended for subdomain)

1. In the left menu, click **"Verified identities"**
2. Click **"Create identity"** button (orange)
3. Select **"Domain"** as Identity type
4. Enter your subdomain: `mail.distributedcreatives.org`
5. Expand **"Advanced DKIM settings"**
   - Check **"Easy DKIM"**
   - Select **"RSA_2048_BIT"** for DKIM signing key length
6. Click **"Create identity"**

### Option B: Email Address Identity (Quick testing)

1. In the left menu, click **"Verified identities"**
2. Click **"Create identity"** button
3. Select **"Email address"** as Identity type
4. Enter: `noreply@distributedcreatives.org`
5. Click **"Create identity"**
6. Check your email and click the verification link

## Step 3: Add DNS Records (For Domain Identity)

After creating the domain identity, AWS will show you DNS records to add:

### You'll see 3 types of records:

1. **DKIM Records** (3 CNAME records):
   ```
   Name: abcd1234567890abcdef._domainkey.mail.distributedcreatives.org
   Type: CNAME
   Value: abcd1234567890abcdef.dkim.amazonses.com

   Name: efgh1234567890abcdef._domainkey.mail.distributedcreatives.org
   Type: CNAME
   Value: efgh1234567890abcdef.dkim.amazonses.com

   Name: ijkl1234567890abcdef._domainkey.mail.distributedcreatives.org
   Type: CNAME
   Value: ijkl1234567890abcdef.dkim.amazonses.com
   ```

2. **Domain Verification Record** (1 TXT record):
   ```
   Name: _amazonses.mail.distributedcreatives.org
   Type: TXT
   Value: "amazonses:aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567="
   ```

3. **SPF Record** (1 TXT record - add this yourself):
   ```
   Name: mail.distributedcreatives.org
   Type: TXT
   Value: "v=spf1 include:amazonses.com ~all"
   ```

### Adding Records to Your DNS Provider:

**For Cloudflare:**
1. Log into Cloudflare
2. Select your domain
3. Go to **DNS** tab
4. For each record:
   - Click **"Add record"**
   - Choose the Type (CNAME or TXT)
   - Enter the Name (remove the domain part if Cloudflare adds it automatically)
   - Enter the Value
   - Leave Proxy status as **DNS only** (gray cloud)
   - Click **Save**

**Important Notes:**
- If the Name ends with your domain, you might need to remove it (Cloudflare adds it automatically)
- Example: `abcd._domainkey.mail.distributedcreatives.org` → enter just `abcd._domainkey.mail`
- For TXT records, include quotes if shown in AWS

## Step 4: Wait for Verification

1. Go back to AWS SES Console
2. Click on your identity
3. You'll see the verification status
4. Domain verification usually takes 5-72 hours (often within 30 minutes)
5. DKIM verification happens after domain verification

**Status indicators:**
- **Verification status**: "Pending" → "Verified" ✓
- **DKIM configuration**: "Pending" → "Success" ✓

## Step 5: Configure From Address

1. Once verified, click on your identity
2. In the **"Authentication"** tab, note your:
   - **Mail FROM domain**: Not set (optional)
   - **DKIM signing**: Enabled ✓

3. For sending emails, you'll use:
   ```
   From: noreply@mail.distributedcreatives.org
   ```

## Step 6: Test Your Configuration

1. Go to **"Verified identities"** → Click your domain
2. Click **"Send test email"** button
3. Fill in:
   - From: `noreply@mail.distributedcreatives.org`
   - To: Your personal email
   - Subject: `Test from AWS SES`
4. Click **"Send test email"**

## Step 7: Request Production Access

By default, SES is in sandbox mode (can only send to verified emails).

1. In left menu, click **"Account dashboard"**
2. You'll see "Your account is in the sandbox"
3. Click **"Request production access"**
4. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: https://signup.distributedcreatives.org
   - **Use case**: "Email verification for member signups"
   - **Additional info**: "We send verification emails to users who sign up for our Genesis Members program. Each user receives one verification email upon signup."
   - **Compliance**: Yes to all

## Step 8: Create IAM User for SES

1. Go to **IAM** service in AWS Console
2. Click **"Users"** → **"Create user"**
3. User name: `dc-ses-user`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search and select: `AmazonSESFullAccess`
7. Click **"Next"** → **"Create user"**
8. Click on the user name
9. Go to **"Security credentials"** tab
10. Click **"Create access key"**
11. Select **"Application running outside AWS"**
12. Click **"Next"** → **"Create access key"**
13. **SAVE THESE SECURELY**:
    - Access key ID: `AKIA...`
    - Secret access key: `wJal...`

## Troubleshooting

### DNS Not Verifying?
- Double-check record values (copy exactly)
- Ensure no extra spaces or quotes
- Wait up to 72 hours
- Try using `dig` to verify:
  ```bash
  dig TXT _amazonses.mail.distributedcreatives.org
  ```

### Can't Send Emails?
- Check you're in the right AWS region
- Verify identity shows as "Verified"
- Ensure you're using the exact email/domain you verified
- Check IAM permissions

### Still in Sandbox?
- Production access can take 24-48 hours
- Check email for AWS response
- May need to provide more details about use case

## Next Steps

Once everything is verified and you have your credentials:

1. Update your `.env` file:
   ```
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=wJal...
   AWS_REGION=us-east-1
   SES_FROM_EMAIL=noreply@mail.distributedcreatives.org
   ```

2. Deploy the Supabase Edge Function:
   ```bash
   supabase functions deploy send-verification-email
   ```

3. Run the database migration in Supabase

4. Test the complete flow!