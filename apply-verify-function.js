// Apply the verify_email_token function to the database
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://jgnyutkpxapaghderjmj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8'

const supabase = createClient(supabaseUrl, supabaseKey)

// The verify_email_token function
const verifyFunction = `
CREATE OR REPLACE FUNCTION verify_email_token(token TEXT)
RETURNS JSON AS $$
DECLARE
  member_record RECORD;
  result JSON;
BEGIN
  -- Find member with this token
  SELECT * INTO member_record 
  FROM members 
  WHERE verification_token = token 
    AND email_verified = false
    AND verification_sent_at > NOW() - INTERVAL '24 hours'; -- Token expires in 24 hours
  
  IF member_record.id IS NOT NULL THEN
    -- Mark email as verified
    UPDATE members 
    SET email_verified = true, 
        verified_at = NOW(),
        verification_token = NULL
    WHERE id = member_record.id;
    
    -- Return success with email
    result := json_build_object(
      'success', true,
      'email', member_record.email,
      'name', member_record.name
    );
    RETURN result;
  ELSE
    -- Return failure
    result := json_build_object(
      'success', false,
      'email', NULL,
      'name', NULL
    );
    RETURN result;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;
`

async function applyFunction() {
  try {
    console.log('Applying verify_email_token function...')
    
    const { data, error } = await supabase.rpc('sql', {
      query: verifyFunction
    })
    
    if (error) {
      console.error('Error applying function:', error)
      // Try alternative approach
      console.log('Trying alternative approach...')
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ query: verifyFunction })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      console.log('Function applied successfully via REST API')
    } else {
      console.log('Function applied successfully:', data)
    }
  } catch (err) {
    console.error('Failed to apply function:', err.message)
    console.log('\nPlease apply this SQL manually in your Supabase dashboard:')
    console.log(verifyFunction)
  }
}

applyFunction()