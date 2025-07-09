import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Security: Only allow DC domains
const allowedOrigins = [
  'https://distributedcreatives.org',
  'https://signup.distributedcreatives.org',
  'https://blog.distributedcreatives.org',
  'https://forum.distributedcreatives.org',
  'https://shop.distributedcreatives.org',
  'http://localhost:4100' // Development only
];

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // Security: Validate origin
  const origin = req.headers.get('Origin');
  const isAllowedOrigin = allowedOrigins.includes(origin || '');
  
  const responseHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
  };
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: responseHeaders 
    })
  }

  // Security: Block requests from unknown origins
  if (!isAllowedOrigin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Origin not allowed' }),
      { 
        status: 403,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Get auth token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization token provided' }),
        { 
          status: 401,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create client with user token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )

    // Set the session
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    })

    if (sessionError || !sessionData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error('Sign out error:', signOutError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to sign out' }),
        { 
          status: 500,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      { 
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Logout error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})