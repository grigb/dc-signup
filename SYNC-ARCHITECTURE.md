# Offline-First Database Sync Architecture

## Strategy: Always Store Local + Sync When Online

### Core Principle
**"Local-first, sync-when-possible"** - Data is always safe locally, database is for aggregation and backup.

## Data Flow Architecture

```
User Submission → localStorage → [Online?] → Database API → Success
                      ↓              ↓
                  [Offline]    [Sync Queue]
                      ↓              ↓
                [Queue Entry] → [Background Sync]
```

## Implementation Strategy

### 1. Dual Storage System
```javascript
// Every submission goes to both:
const submission = {
  id: generateUUID(),
  name: "John Creator",
  email: "john@example.com", 
  creatorTypes: ["Traditional Arts"],
  timestamp: new Date().toISOString(),
  deviceId: "ipad-conference-01",
  syncStatus: "pending|synced|failed",
  attempts: 0
}

// Store locally (always)
localStorage.setItem(`submission-${id}`, JSON.stringify(submission))

// Try to sync immediately (if online)
if (navigator.onLine) {
  syncToDatabase(submission)
}
```

### 2. Background Sync Process
```javascript
// Runs every 30 seconds when online
setInterval(() => {
  if (navigator.onLine) {
    syncPendingSubmissions()
  }
}, 30000)

// Also sync when connection returns
window.addEventListener('online', syncPendingSubmissions)
```

### 3. Database Options

#### Option A: Supabase (Recommended)
**Pros:**
- Free tier (50k MAU)
- Real-time capabilities
- Built-in auth if needed later
- PostgreSQL (robust)
- Already researched for DC project

**Setup:**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Insert submission
const { data, error } = await supabase
  .from('signups')
  .insert([submission])
```

#### Option B: Simple Node.js + JSON
**Pros:**
- Quick to deploy
- No external dependencies
- Easy to understand
- Can deploy to Vercel

**Setup:**
```javascript
// api/signup.js (Vercel serverless function)
export default async function handler(req, res) {
  const submission = req.body
  
  // Save to JSON file or simple database
  const fs = require('fs')
  const submissions = JSON.parse(fs.readFileSync('data.json'))
  submissions.push(submission)
  fs.writeFileSync('data.json', JSON.stringify(submissions))
  
  res.json({ success: true, id: submission.id })
}
```

#### Option C: Airtable API
**Pros:**
- Visual interface for viewing data
- Easy API
- Good for non-technical users

### 4. Conflict Resolution Strategy

**Duplicate Prevention:**
- Check for existing email before submitting
- If duplicate online, update local record as "duplicate"
- If duplicate offline, queue for manual review

**Data Integrity:**
```javascript
const checkForDuplicate = async (email) => {
  // Check local storage first
  const localDupe = checkLocalDuplicate(email)
  
  // If online, check database
  if (navigator.onLine) {
    const remoteDupe = await checkRemoteDuplicate(email) 
  }
  
  return localDupe || remoteDupe
}
```

## Implementation Plan

### Phase 1: Enhanced Local Storage (Tonight)
- Better IndexedDB storage with Dexie.js
- Sync queue management
- Connection status detection

### Phase 2: Database Integration (Tomorrow)
- Choose database solution
- Build API endpoints
- Implement basic sync

### Phase 3: Robust Sync (Complete)
- Background sync
- Conflict resolution
- Error handling
- Admin dashboard

## Database Schema

### Signups Table
```sql
CREATE TABLE signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  creator_types JSONB,
  country VARCHAR(100),
  first_150_optin BOOLEAN DEFAULT false,
  member_bio TEXT,
  device_id VARCHAR(100),
  referral_source VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sync_source VARCHAR(50) DEFAULT 'web' -- 'web', 'conference', 'mobile'
);

-- Index for duplicate checking
CREATE INDEX idx_signups_email ON signups(email);
CREATE INDEX idx_signups_device ON signups(device_id);
```

## Conference-Specific Features

### Multi-Device Coordination
- Each iPad has unique `deviceId`
- Track which device collected which signups
- Sync status per device
- Offline device status dashboard

### Data Export for Organizers
```javascript
// Export all submissions as CSV
const exportData = () => {
  const allSubmissions = getAllLocalSubmissions()
  const csv = convertToCSV(allSubmissions)
  downloadCSV(csv, `dc-signups-${new Date().toISOString()}.csv`)
}
```

### Sync Status Dashboard
```javascript
// Show sync status for conference staff
const syncStatus = {
  totalSubmissions: 45,
  syncedToDatabase: 42,
  pendingSync: 3,
  failedSync: 0,
  lastSyncTime: "2025-01-31T15:30:00Z"
}
```

## Recommended Next Steps

1. **Choose Database** (Supabase recommended)
2. **Build v2-enhanced** with IndexedDB + sync queue
3. **Add simple API endpoint** for immediate testing
4. **Test sync functionality** on mobile devices
5. **Build admin dashboard** for conference data management

This architecture ensures:
- ✅ **Zero data loss** (always stored locally)
- ✅ **Works completely offline** 
- ✅ **Syncs automatically** when online
- ✅ **Handles conflicts** gracefully
- ✅ **Conference-ready** for multiple devices