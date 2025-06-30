# Setting up signup.distributedcreatives.org

## Step 1: Add Custom Domain in Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Workers & Pages"**
3. Click on your **dc-signup** project
4. Go to **"Custom domains"** tab
5. Click **"Set up a custom domain"**
6. Enter: `signup.distributedcreatives.org`
7. Click **"Continue"**

## Step 2: DNS Configuration

Since distributedcreatives.org is already on Cloudflare:

1. Cloudflare will automatically add the CNAME record
2. You'll see: `signup.distributedcreatives.org → dc-signup.pages.dev`
3. Click **"Activate domain"**

## Step 3: Wait for SSL Certificate

- Cloudflare will automatically provision an SSL certificate
- This usually takes 5-15 minutes
- You'll see a green checkmark when ready

## Step 4: Update Your Code

Once the domain is active, update any hardcoded URLs:

1. In `verify.html` and other files, update:
   - From: `https://dc-signup.pages.dev/verify?token=...`
   - To: `https://signup.distributedcreatives.org/verify?token=...`

2. Update the Edge Function if needed:
   ```typescript
   const verificationUrl = `https://signup.distributedcreatives.org/verify?token=${verificationToken}`
   ```

## Alternative: Subdomain on Different Domain

If you don't want to use distributedcreatives.org, you can:
1. Use any domain you own
2. Add it to Cloudflare (if not already)
3. Follow the same steps above

## Troubleshooting

**"Domain already exists" error**:
- The domain might be used by another Cloudflare Pages project
- Check all your projects for conflicts

**SSL not working**:
- Make sure the domain's SSL/TLS setting is "Full" or "Full (strict)"
- Wait up to 15 minutes for certificate provisioning

**404 errors**:
- Ensure your build output is in the correct directory
- Check that index.html exists in your deployment

## Testing
After setup, you can access:
- Main page: https://signup.distributedcreatives.org
- Verify page: https://signup.distributedcreatives.org/verify?token=test