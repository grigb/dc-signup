# Supabase Setup Guide for DC Signup System

## Step 1: Create Supabase Account (2 minutes)

1. Go to **https://supabase.com**
2. Click "Start your project" 
3. Sign up with GitHub (recommended) or email
4. Verify email if needed

## Step 2: Create New Project (3 minutes)

1. Click "New Project"
2. Choose your organization (probably your personal one)
3. Fill in project details:
   - **Name**: `dc-signup-system`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. **Wait 2-3 minutes** for database to provision

## Step 3: Get Your Connection Details (1 minute)

Once project is ready:
1. Go to **Settings** → **API**
2. Copy these values (we'll need them):
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

## Step 4: Create Database Table (3 minutes)

1. Go to **SQL Editor** in the sidebar
2. Click "New Query"
3. Paste this SQL and click **RUN**:

```sql
-- Create signups table
CREATE TABLE signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  creator_types JSONB DEFAULT '[]'::jsonb,
  country VARCHAR(100),
  first_150_optin BOOLEAN DEFAULT false,
  member_bio TEXT,
  device_id VARCHAR(100),
  referral_source VARCHAR(100) DEFAULT 'conference',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_source VARCHAR(50) DEFAULT 'web'
);

-- Create indexes for performance
CREATE INDEX idx_signups_email ON signups(email);
CREATE INDEX idx_signups_created_at ON signups(created_at);
CREATE INDEX idx_signups_device_id ON signups(device_id);

-- Enable Row Level Security (RLS)
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for signups)
CREATE POLICY "Allow public inserts" ON signups
  FOR INSERT WITH CHECK (true);

-- Create policy to allow selects (for duplicate checking)
CREATE POLICY "Allow public selects" ON signups
  FOR SELECT USING (true);
```

## Step 5: Test Database Connection (2 minutes)

1. Go to **Table Editor** → **signups**
2. You should see your new empty table
3. Click "Insert" → "Insert row" to test:
   - **name**: "Test User"
   - **email**: "test@example.com"
   - **creator_types**: `["Traditional Arts"]`
4. Click "Save" - if it works, you're ready!

## Step 6: Environment Variables

Create a `.env` file in your project:

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

## Step 7: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 8: Test Connection

Create this test file to verify everything works:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // Test insert
  const { data, error } = await supabase
    .from('signups')
    .insert([
      {
        name: 'Claude Test',
        email: 'claude@test.com',
        creator_types: ['Technical Creation'],
        country: 'United States'
      }
    ])
    .select()
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Success! Inserted:', data)
  }
}

testConnection()
```

Run with: `node test-supabase.js`

## Troubleshooting

### Common Issues:

1. **"relation signups does not exist"**
   - Make sure you ran the SQL in Step 4
   - Check Table Editor to see if table exists

2. **"Failed to fetch"** 
   - Check your Project URL and API key
   - Make sure project is fully provisioned (wait a few more minutes)

3. **"new row violates row-level security"**
   - Make sure you created the RLS policies in Step 4

### Quick Verification Checklist:
- ✅ Project created and provisioned
- ✅ Got Project URL and Anon Key  
- ✅ Created `signups` table with SQL
- ✅ RLS policies created
- ✅ Test insert worked in Table Editor

## Next Steps

Once this is working:
1. I'll build v3-database version that uses this Supabase setup
2. We'll test offline → online sync
3. Add the enhanced creator type selection

**Ready to proceed?** Let me know when you have:
- Project URL 
- Anon Key
- Table created and tested

Then I'll build the database-connected version!