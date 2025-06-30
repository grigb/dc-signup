# Security Advisory

## ⚠️ JWT Token Exposure Incident

**Date**: June 29, 2025  
**Severity**: High  
**Status**: Mitigated  

### Issue
The Supabase JWT anonymous key was accidentally committed to the public GitHub repository `grigb/dc-signup`. This key was exposed in multiple files and Git history.

### Immediate Actions Taken
1. ✅ Replaced hardcoded JWT with placeholder text in all files
2. ✅ Updated code to use environment variables 
3. ✅ Added security warnings in affected files
4. ✅ Created configuration template

### Required Actions
1. **URGENT**: Rotate the Supabase anon key in Supabase dashboard
2. Set new key as environment variable in production (Cloudflare Pages)
3. Update local development configuration

### Affected Files
- `index.html` (main signup form)
- `admin.html` (admin panel)
- `test-supabase-setup.js`
- `verify-setup.js`
- `apply-schemas.js`
- `autonomous-test.js`
- Documentation files (marked with warnings)

### Migration Steps
1. **In Supabase Dashboard**: Generate new anon key
2. **In Cloudflare Pages**: Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. **For Local Development**: Create `config.js` with new credentials (excluded from Git)

### Prevention
- Added `.gitignore` for sensitive files
- Environment variable configuration
- Security documentation

### References
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [GitGuardian Secret Detection](https://gitguardian.com/)