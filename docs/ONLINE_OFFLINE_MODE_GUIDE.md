# Online/Offline Mode Guide - DC Signup System

## Overview
The DC Signup System is designed to work both online and offline. It automatically detects whether it can connect to Supabase and adjusts its behavior accordingly.

## How It Works

### Online Mode Detection
The system runs in online mode when:
1. Valid Supabase credentials are configured
2. No `?offline=true` URL parameter is present
3. Network connection to Supabase is available

### Configuration Check
```javascript
// The system checks for valid API configuration
const hasValidApiKey = SUPABASE_ANON_KEY !== '__SUPABASE_' + 'ANON_KEY__' 
                      && SUPABASE_ANON_KEY.startsWith('eyJ')
```

### Testing Offline Mode
To force offline mode for testing, add `?offline=true` to the URL:
```
http://localhost:4100/?offline=true
```

## Current Configuration Status

### ✅ Online Mode is Enabled
- Supabase URL: `https://jgnyutkpxapaghderjmj.supabase.co`
- API Key: Valid JWT token configured
- Creator types load from database
- Submissions save to database and locally
- Offline submissions sync automatically

### Console Indicators

**Online Mode:**
```
✅ API configuration detected. Online sync enabled.
✅ Creator types loaded from database: 1.0
Saved to database: null (indicates successful save)
```

**Offline Mode (forced with ?offline=true):**
```
🧪 Running in test offline mode
💾 Skipping database save - API not configured. Saved locally only.
```

## How Data Flows

### In Online Mode:
1. User fills out form
2. On submission:
   - Data saves to Supabase database
   - Backup copy saved to IndexedDB
   - Email verification sent automatically
3. Any pending offline submissions sync automatically

### In Offline Mode:
1. User fills out form
2. On submission:
   - Data saves to IndexedDB only
   - No email verification sent
3. When back online, submissions sync automatically

## Troubleshooting

### System Appears Offline When It Shouldn't Be

1. **Check Console Messages**
   - Look for "✅ API configuration detected" vs "⚠️ API configuration incomplete"

2. **Verify URL Parameters**
   - Remove `?offline=true` if present

3. **Check Network Connection**
   - Ensure Supabase is accessible
   - Check for CORS or firewall issues

4. **Verify Configuration**
   - Ensure Supabase credentials are valid
   - Check that API key starts with 'eyJ'

### Forcing Online Mode
Simply navigate to the base URL without parameters:
```
http://localhost:4100/
```

### Checking Pending Offline Submissions
The button shows count: "View Offline (8)"
- This indicates 8 submissions waiting to sync
- They'll sync automatically when online

## Key Code Locations

- **Configuration**: Lines 1284-1288 in `src/index.html`
- **Offline Mode Check**: Line 1317 - `const testOfflineMode = urlParams.get('offline') === 'true'`
- **Database Save Logic**: Lines 1964-2013 in `saveToDatabase()` function
- **Sync Logic**: Lines 2077-2111 in `syncOfflineSubmissions()` function

## Best Practices

1. **Production Deployment**
   - Never include `?offline=true` in production URLs
   - Ensure Supabase credentials are properly configured
   - Monitor sync status for offline submissions

2. **Testing**
   - Use `?offline=true` to test offline functionality
   - Verify sync works when switching back to online
   - Test with network throttling in DevTools

3. **User Communication**
   - System shows sync status automatically
   - Users see "Syncing X pending submissions..."
   - Success/failure messages appear for each sync

## Summary

The system is currently configured correctly for online mode with valid Supabase credentials. It will:
- Save all submissions to the database when online
- Automatically sync any offline submissions
- Fall back to offline mode if network issues occur
- Work fully offline when forced with `?offline=true` parameter