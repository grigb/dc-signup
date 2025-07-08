// Supabase Edge Function for sending verification emails via AWS SES REST API
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts"
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// AWS SES REST API implementation
async function sendEmailViaSES(email: string, name: string, verificationToken: string) {
  const region = Deno.env.get('AWS_REGION') || 'us-east-1'
  const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
  const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
  const fromEmail = Deno.env.get('SES_FROM_EMAIL') || 'noreply@mail.distributedcreatives.org'

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials not configured')
  }

  // Use production URL - can be overridden with VERIFICATION_BASE_URL environment variable
  const baseUrl = Deno.env.get('VERIFICATION_BASE_URL') || 'https://signup.distributedcreatives.org'
  const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`
  
  // Construct the email
  const subject = 'Welcome to Distributed Creatives - Please Verify Your Email'
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 20px; color: #333; font-size: 24px;">Welcome to Distributed Creatives!</h1>
              <p style="margin: 0 0 30px; color: #666; font-size: 16px; line-height: 1.5;">
                Hi ${name},<br><br>
                Thank you for becoming a member of Distributed Creatives. You're joining a community of creators building the future of creative collaboration.<br><br>
                Please verify your email address to activate your membership.
              </p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Verify Email Address
              </a>
              <p style="margin: 30px 0 0; color: #999; font-size: 14px;">
                Or copy and paste this link:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin: 30px 0 0; color: #999; font-size: 14px;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textBody = `Welcome to Distributed Creatives!

Hi ${name},

Thank you for becoming a member of Distributed Creatives. You're joining a community of creators building the future of creative collaboration.

Please verify your email address to activate your membership.

Verify your email: ${verificationUrl}

This link will expire in 24 hours.

Best regards,
The Distributed Creatives Team`

  // Create form data for SES
  const formData = new URLSearchParams({
    'Action': 'SendEmail',
    'Source': fromEmail,
    'Destination.ToAddresses.member.1': email,
    'Message.Subject.Data': subject,
    'Message.Subject.Charset': 'UTF-8',
    'Message.Body.Html.Data': htmlBody,
    'Message.Body.Html.Charset': 'UTF-8',
    'Message.Body.Text.Data': textBody,
    'Message.Body.Text.Charset': 'UTF-8',
    'Version': '2010-12-01'
  })

  // Create signature for AWS SES API
  const method = 'POST'
  const service = 'email'
  const host = `email.${region}.amazonaws.com`
  const endpoint = `https://${host}/`
  
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substr(0, 8)
  
  // Create canonical request
  const canonicalUri = '/'
  const canonicalQuerystring = ''
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-date'
  const payloadHash = await sha256(formData.toString())
  
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${await sha256(canonicalRequest)}`
  
  // Calculate signature
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service)
  const signature = await hmacSha256(signingKey, stringToSign)
  
  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  
  // Make the request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Amz-Date': amzDate,
      'Authorization': authorizationHeader
    },
    body: formData.toString()
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SES API error: ${response.status} - ${error}`)
  }

  return true
}

// Helper functions for AWS signature
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256(key: Uint8Array, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<Uint8Array> {
  const kDate = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode('AWS4' + key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(dateStamp))
  const kRegion = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new Uint8Array(kDate), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(regionName))
  const kService = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new Uint8Array(kRegion), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(serviceName))
  const kSigning = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new Uint8Array(kService), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode('aws4_request'))
  return new Uint8Array(kSigning)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, verificationToken } = await req.json()
    
    console.log('Sending verification email:', { email, name })
    
    // Send email via AWS SES
    await sendEmailViaSES(email, name, verificationToken)
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})