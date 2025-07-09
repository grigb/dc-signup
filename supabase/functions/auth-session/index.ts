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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

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
    const supabaseUser = createClient(
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
    const { data: sessionData, error: sessionError } = await supabaseUser.auth.setSession({
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

    const user = sessionData.user

    // Get member data
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', user.email)
      .single()

    if (memberError) {
      console.error('Member lookup error:', memberError)
      return new Response(
        JSON.stringify({ success: false, error: 'Member not found' }),
        { 
          status: 404,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return user session data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: memberData.name,
          creator_types: memberData.creator_types || [],
          verified: memberData.email_verified || false,
          avatar_url: memberData.avatar_url || null,
          created_at: memberData.created_at,
          member_status: memberData.status || 'pending'
        }
      }),
      { 
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Session check error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})