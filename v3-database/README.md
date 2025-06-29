# v3-database: Database Integration

## Setup Required

Before this version works, you need to:

1. **Complete Supabase setup** (see SUPABASE-SETUP.md)
2. **Update credentials** in index.html:

```javascript
// Replace these lines around line 185:
const SUPABASE_URL = 'https://your-project.supabase.co'  // ← Your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key-here'           // ← Your Anon Key
```

## Features

### ✅ Offline-First Architecture
- **Always saves locally first** (never lose data)
- **Syncs to database when online**
- **Works completely offline**

### ✅ Enhanced Form
- Creator type selection (checkboxes)
- Country dropdown
- Duplicate email checking
- Better validation

### ✅ Sync Management
- **Auto-sync every 30 seconds** when online
- **Manual sync button** for immediate sync
- **Sync status display** (local vs synced counts)
- **Connection status indicator**

### ✅ Conference Ready
- **Multi-device support** (each device gets unique ID)
- **Offline capability** for conferences
- **Real-time sync** when internet available

## Testing Workflow

1. **Setup Supabase** (SUPABASE-SETUP.md)
2. **Update credentials** in index.html
3. **Test online**: Submit form, verify it saves to database
4. **Test offline**: Disconnect internet, submit form, reconnect
5. **Verify sync**: Check that offline submissions sync automatically

## Database Schema

All submissions save to `signups` table with:
- `name`, `email`, `creator_types[]`
- `country`, `device_id`, `referral_source`
- `created_at`, `sync_source`

## Next Steps

After this works:
- Add hierarchical creator type selector
- Add "First 150 Members" opt-in
- Build admin dashboard
- Deploy final version

**Ready to test once Supabase is configured!**