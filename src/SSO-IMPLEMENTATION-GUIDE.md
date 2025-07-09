# DC Single Sign-On (SSO) Implementation Guide

## Overview
This guide shows how to implement Single Sign-On across all Distributed Creatives sites so users can sign in once and access all properties.

## Architecture

```
User visits any DC site → SSO Widget checks auth → Shows login status
                          ↓                        ↓
                    (if not logged in)      (if logged in)
                          ↓                        ↓
                    Opens auth modal       Shows user info + logout
                          ↓                        ↓
                    User signs in          User can access all DC sites
                          ↓                        ↓
                    Session stored         Session shared across sites
                          ↓                        ↓
                    All DC sites           Logout works across all sites
                    now show user as
                    logged in
```

## Implementation Steps

### 1. Set Up Central Auth System

**Main signup system:** `https://signup.distributedcreatives.org`

**Required API endpoints:**
- `GET /api/auth/session` - Check if user is logged in
- `POST /api/auth/login` - Log user in
- `POST /api/auth/logout` - Log user out
- `GET /api/user/profile` - Get user profile

### 2. Add SSO Widget to Any Site

**Option A: Auto-initialize with data attributes**
```html
<div id="dc-auth" 
     data-dc-sso
     data-show-avatar="true"
     data-show-name="true"
     data-show-creator-badge="true"
     data-compact="false">
</div>

<script src="https://signup.distributedcreatives.org/dc-sso-widget.js"></script>
```

**Option B: JavaScript initialization**
```html
<div id="dc-auth"></div>

<script src="https://signup.distributedcreatives.org/dc-sso-widget.js"></script>
<script>
initDCSSO('dc-auth', {
    showAvatar: true,
    showName: true,
    showCreatorBadge: true,
    compact: false,
    theme: 'default',
    onLogin: function(user) {
        console.log('User logged in:', user);
        // Your custom logic here
    },
    onLogout: function() {
        console.log('User logged out');
        // Your custom logic here
    }
});
</script>
```

### 3. Widget Display Options

**Logged Out State:**
- "Join DC Community" button (opens signup modal)
- "Sign In" button (opens login modal)

**Logged In State:**
- User avatar (if available)
- User name
- Creator badge (if user is a creator)
- "Profile" button
- "Logout" button

### 4. Customization Options

**Widget Options:**
```javascript
{
    showAvatar: true,        // Show user avatar
    showName: true,          // Show user name
    showCreatorBadge: true,  // Show creator badge
    compact: false,          // Compact mode
    theme: 'default',        // Theme: 'default' or 'dark'
    onLogin: function(user) {}, // Called when user logs in
    onLogout: function() {}     // Called when user logs out
}
```

**CSS Custom Properties:**
```css
:root {
    --dc-primary-color: #667eea;
    --dc-secondary-color: #764ba2;
    --dc-background-color: #f8f9fa;
    --dc-text-color: #333;
    --dc-border-color: #e9ecef;
}
```

### 5. Session Management

**How it works:**
1. User logs in on any DC site
2. Session stored in `localStorage` and server-side
3. Other DC sites check session on load
4. Session synced across tabs/windows
5. Logout on one site logs out everywhere

**Session Storage:**
```javascript
// localStorage key: 'dc_user_session'
{
    user: {
        id: "user-id",
        email: "user@example.com",
        name: "User Name",
        creator_types: ["Software Development", "Writing"],
        verified: true,
        avatar_url: "https://...",
        created_at: "2025-01-01T00:00:00Z"
    },
    expires: 1672531200000  // 24 hours from login
}
```

### 6. Integration Examples

**Blog Site Header:**
```html
<header>
    <h1>DC Blog</h1>
    <div id="user-status" data-dc-sso data-compact="true"></div>
</header>
```

**Forum Site Sidebar:**
```html
<aside>
    <div id="user-info" data-dc-sso data-show-creator-badge="true"></div>
    <div id="member-content" style="display: none;">
        <h3>Member Tools</h3>
        <ul>
            <li><a href="/create-post">Create Post</a></li>
            <li><a href="/my-posts">My Posts</a></li>
        </ul>
    </div>
</aside>

<script>
initDCSSO('user-info', {
    onLogin: function(user) {
        document.getElementById('member-content').style.display = 'block';
    },
    onLogout: function() {
        document.getElementById('member-content').style.display = 'none';
    }
});
</script>
```

**E-commerce Site:**
```html
<div id="cart-header">
    <div id="user-account" data-dc-sso data-compact="true"></div>
    <div id="cart-items">Cart (0)</div>
</div>

<script>
initDCSSO('user-account', {
    onLogin: function(user) {
        // Load user's cart from server
        loadUserCart(user.id);
    }
});
</script>
```

### 7. Backend Integration

**Required Supabase Functions:**

1. **Session Check Function** (`/api/auth/session`)
```sql
-- Check if user is authenticated
SELECT 
    u.id,
    u.email,
    m.name,
    m.creator_types,
    m.email_verified,
    m.avatar_url,
    m.created_at
FROM auth.users u
JOIN members m ON u.email = m.email
WHERE u.id = $1 AND u.email_confirmed_at IS NOT NULL;
```

2. **Login Function** (`/api/auth/login`)
```javascript
// Use Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
});
```

3. **Logout Function** (`/api/auth/logout`)
```javascript
await supabase.auth.signOut();
```

### 8. Security Considerations

**CORS Configuration:**
```javascript
// Allow all DC domains
const allowedOrigins = [
    'https://distributedcreatives.org',
    'https://blog.distributedcreatives.org',
    'https://forum.distributedcreatives.org',
    'https://shop.distributedcreatives.org'
];
```

**Cookie Settings:**
```javascript
// Set secure, httpOnly cookies
{
    domain: '.distributedcreatives.org',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}
```

### 9. Testing

**Test these scenarios:**
1. User signs up on main site → Should be logged in on all sites
2. User logs out on one site → Should be logged out everywhere
3. User changes profile → Should update on all sites
4. Session expires → Should log out on all sites
5. Multiple tabs → Should sync login state

### 10. Analytics Integration

**Track user behavior across sites:**
```javascript
initDCSSO('auth-widget', {
    onLogin: function(user) {
        // Send to analytics
        analytics.identify(user.id, {
            name: user.name,
            email: user.email,
            creator_types: user.creator_types,
            site: window.location.hostname
        });
        
        analytics.track('User Login', {
            site: window.location.hostname,
            user_type: user.creator_types.length > 0 ? 'creator' : 'supporter'
        });
    }
});
```

## Benefits

1. **Single Sign-On** - Users log in once, access all DC sites
2. **Unified Identity** - Same user profile across all properties
3. **Better Analytics** - Track user journey across sites
4. **Improved UX** - Seamless experience across DC network
5. **Centralized Management** - One place to manage all users

## Next Steps

1. Implement API endpoints in Supabase
2. Deploy SSO widget to main auth server
3. Add widget to first DC site for testing
4. Roll out to remaining DC sites
5. Monitor and optimize performance

This SSO system will create a seamless experience across all Distributed Creatives properties!