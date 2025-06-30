// Supabase Edge Function for sending verification emails via AWS SES
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SESClient, SendEmailCommand } from "https://esm.sh/@aws-sdk/client-ses@3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, verificationToken } = await req.json()

    // Initialize AWS SES client
    const sesClient = new SESClient({
      region: Deno.env.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
      },
    })

    const verificationUrl = `https://signup.distributedcreatives.org/verify?token=${verificationToken}`

    const params = {
      Source: Deno.env.get('SES_FROM_EMAIL') || 'noreply@distributedcreatives.org',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Verify your email - Distributed Creatives Genesis Membership',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
                Thank you for joining the Genesis Members of Distributed Creatives. Please verify your email address to complete your registration.
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
</html>`,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Welcome to Distributed Creatives!

Hi ${name},

Thank you for joining the Genesis Members of Distributed Creatives. Please verify your email address to complete your registration.

Verify your email: ${verificationUrl}

This link will expire in 24 hours.

Best regards,
The Distributed Creatives Team`,
            Charset: 'UTF-8',
          },
        },
      },
    }

    const command = new SendEmailCommand(params)
    await sesClient.send(command)

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