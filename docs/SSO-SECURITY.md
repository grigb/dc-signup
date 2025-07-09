# DC SSO Security Documentation

## Overview
This document outlines the security measures implemented in the DC Single Sign-On (SSO) system to protect user data and prevent unauthorized access.

## Security Measures Implemented

### 1. Domain Restriction
**What it does:** Only allows SSO widget to function on authorized DC domains  
**How it works:** 
- Widget checks `window.location.hostname` against whitelist
- API endpoints validate `Origin` header against allowed domains
- Unauthorized domains are blocked with 403 errors

**Allowed domains:**
- `distributedcreatives.org`
- `signup.distributedcreatives.org`
- `blog.distributedcreatives.org`
- `forum.distributedcreatives.org`
- `shop.distributedcreatives.org`
- `localhost` (development only)

### 2. CORS Security
**What it does:** Prevents cross-origin requests from unauthorized domains  
**How it works:**
- Dynamic CORS headers based on validated origins
- No wildcard (`*`) origins in production
- Credential support only for allowed domains

### 3. Token-Based Authentication
**What it does:** Uses JWT tokens for secure session management  
**How it works:**
- Tokens issued by Supabase Auth
- Tokens validated server-side on each request
- Tokens stored securely in localStorage with expiration
- No sensitive data in client-side storage

### 4. Input Validation & XSS Prevention
**What it does:** Prevents malicious code injection  
**How it works:**
- All user input escaped using `escapeHtml()` function
- Server-side validation of all API inputs
- Parameterized database queries only

### 5. Session Management
**What it does:** Secure session handling across sites  
**How it works:**
- Sessions expire after 24 hours
- Invalid sessions automatically cleared
- Session validation includes structure checks
- Cross-tab synchronization for logout

### 6. Environment Variables
**What it does:** Keeps sensitive configuration secure  
**How it works:**
- Database credentials in environment variables
- API keys not exposed in client code
- Configuration separated from code

## What's NOT Exposed

### ❌ Never in Client Code:
- Database passwords
- API keys
- Service account credentials
- Database connection strings
- Internal server URLs

### ❌ Never in Repository:
- `.env` files
- `config.json` with secrets
- Database dumps with real data
- API keys in comments or code

### ❌ Never in localStorage:
- Passwords
- API keys
- Sensitive personal data
- Payment information

## What IS Safe to Expose

### ✅ Safe in Client Code:
- Public API endpoints
- Domain whitelist
- UI configuration
- Public Supabase URL (anon key protected)

### ✅ Safe in Repository:
- API endpoint structure
- Configuration templates
- Security documentation
- Public domain names

## Security Checklist

Before deployment, verify:

- [ ] All API endpoints use environment variables for credentials
- [ ] Domain whitelist is properly configured
- [ ] CORS headers restrict to DC domains only
- [ ] No API keys or passwords in client code
- [ ] All user inputs are escaped/validated
- [ ] Session tokens have proper expiration
- [ ] Error messages don't expose sensitive info
- [ ] Development domains removed from production

## Threat Model

### Threats Mitigated:
1. **Unauthorized domain usage** - Domain whitelist prevents widget use on non-DC sites
2. **Cross-site scripting (XSS)** - Input escaping prevents malicious code injection
3. **Session hijacking** - Token validation and expiration limit session abuse
4. **Data exposure** - No sensitive data stored client-side
5. **API abuse** - CORS and origin validation prevent unauthorized API calls

### Threats Still Present:
1. **Compromised DC domain** - If a DC site is compromised, SSO could be affected
2. **Browser vulnerabilities** - Client-side storage could be accessed by malware
3. **Social engineering** - Users could be tricked into sharing credentials
4. **Server-side attacks** - Supabase infrastructure could be targeted

## Incident Response

If security breach suspected:

1. **Immediate:** Revoke all active sessions via Supabase dashboard
2. **Short-term:** Update domain whitelist to remove compromised domains
3. **Long-term:** Rotate API keys and review access logs

## Monitoring

Regular security checks:
- Monitor Supabase logs for unauthorized access attempts
- Review domain whitelist quarterly
- Check for XSS attempts in error logs
- Audit session duration and cleanup

## Compliance

This SSO system:
- ✅ Follows OWASP security guidelines
- ✅ Uses secure session management
- ✅ Implements proper input validation
- ✅ Maintains audit trails
- ✅ Protects user privacy

## Updates

When adding new DC domains:
1. Update `allowedOrigins` in all three API functions
2. Update `allowedDomains` in SSO widget
3. Test CORS functionality
4. Update this documentation

## Security Contact

For security issues:
- Report immediately to: [security contact]
- Do not disclose publicly until patched
- Include detailed reproduction steps