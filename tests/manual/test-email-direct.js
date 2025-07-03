// Direct test of the email verification system
const SUPABASE_URL = 'https://jgnyutkpxapaghderjmj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnbnl1dGtweGFwYWdoZGVyam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTE5MTMsImV4cCI6MjA2Njg2NzkxM30.4GkS72fKX9trYQIfeXMmZJ2iM2menAjYdCHuHb3dOs8'

// Test the Edge Function directly
async function testEdgeFunction() {
    console.log('Testing Edge Function directly...')
    
    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-verification-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'your-verified-email@example.com', // Replace with your verified email
                name: 'Test User',
                verificationToken: 'test-token-' + Date.now()
            })
        })
        
        const result = await response.json()
        console.log('Edge Function Response:', result)
        
        if (result.success) {
            console.log('✅ Email sent successfully!')
        } else {
            console.log('❌ Email failed:', result.error)
        }
    } catch (error) {
        console.error('Error calling Edge Function:', error)
    }
}

// Run the test
console.log('Replace "your-verified-email@example.com" with your AWS SES verified email')
console.log('Then run: node test-email-direct.js')

// Uncomment to run:
// testEdgeFunction()