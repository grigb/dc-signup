// API Endpoints for DC SSO System
// These should be implemented as Supabase Edge Functions or similar

/* 
REQUIRED ENDPOINTS:

1. GET /api/auth/session
   - Check if user is authenticated
   - Return user data if logged in
   - Response: { success: true, user: {...} } or { success: false }

2. POST /api/auth/logout
   - Clear user session
   - Response: { success: true }

3. POST /api/auth/login
   - Authenticate user with email/password
   - Set session cookie
   - Response: { success: true, user: {...} } or { success: false, error: "..." }

4. POST /api/auth/signup
   - Create new user account
   - Send verification email
   - Response: { success: true, user: {...} } or { success: false, error: "..." }

5. GET /api/user/profile
   - Get current user profile
   - Response: { success: true, user: {...} }

6. PUT /api/user/profile
   - Update user profile
   - Response: { success: true, user: {...} }
*/

// Example Supabase Edge Function for session check
const sessionCheckFunction = `
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    )
    
    try {
        // Get session from cookie or header
        const authHeader = req.headers.authorization
        const token = authHeader?.replace('Bearer ', '')
        
        if (!token) {
            return res.json({ success: false, error: 'No token provided' })
        }
        
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
            return res.json({ success: false, error: 'Invalid token' })
        }
        
        // Get additional user data from members table
        const { data: memberData, error: memberError } = await supabase
            .from('members')
            .select('*')
            .eq('email', user.email)
            .single()
        
        if (memberError) {
            return res.json({ success: false, error: 'User not found' })
        }
        
        // Return user data
        return res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: memberData.name,
                creator_types: memberData.creator_types,
                verified: memberData.email_verified,
                avatar_url: memberData.avatar_url,
                created_at: memberData.created_at
            }
        })
        
    } catch (error) {
        console.error('Session check error:', error)
        return res.json({ success: false, error: 'Internal server error' })
    }
}
`;

// Example usage in HTML
const htmlExample = `
<!DOCTYPE html>
<html>
<head>
    <title>My DC Site</title>
</head>
<body>
    <header>
        <h1>My Distributed Creatives Site</h1>
        
        <!-- SSO Widget Container -->
        <div id="dc-auth-widget" 
             data-dc-sso
             data-show-avatar="true"
             data-show-name="true"
             data-show-creator-badge="true"
             data-compact="false"
             data-theme="default">
        </div>
    </header>
    
    <main>
        <h2>Welcome to our community site!</h2>
        <p>This content is available to all users.</p>
        
        <!-- Member-only content -->
        <div id="member-content" style="display: none;">
            <h3>Member-only content</h3>
            <p>This content is only shown to logged-in members.</p>
        </div>
    </main>
    
    <!-- Load DC SSO Widget -->
    <script src="https://signup.distributedcreatives.org/dc-sso-widget.js"></script>
    
    <script>
        // Initialize with custom options
        initDCSSO('dc-auth-widget', {
            showAvatar: true,
            showName: true,
            showCreatorBadge: true,
            compact: false,
            theme: 'default',
            onLogin: function(user) {
                console.log('User logged in:', user);
                // Show member content
                document.getElementById('member-content').style.display = 'block';
                
                // Send user data to your analytics
                analytics.identify(user.id, {
                    name: user.name,
                    email: user.email,
                    creator_types: user.creator_types
                });
            },
            onLogout: function() {
                console.log('User logged out');
                // Hide member content
                document.getElementById('member-content').style.display = 'none';
            }
        });
    </script>
</body>
</html>
`;

export { sessionCheckFunction, htmlExample };