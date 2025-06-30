# Simple Database Options (No Setup Required)

## Option 1: 5-Minute JSON API (Recommended for Tonight)

**Super simple Node.js API that saves to a JSON file**

### Setup Time: 5 minutes
### Pros:
- No external accounts needed
- Deploy to Vercel instantly
- Easy to understand
- View data as simple JSON file

### Implementation:
```javascript
// api/signup.js (Vercel serverless function)
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const submission = {
      ...req.body,
      id: Date.now().toString(),
      serverTimestamp: new Date().toISOString()
    }
    
    // Read existing data
    const dataPath = path.join(process.cwd(), 'data', 'signups.json')
    let signups = []
    
    try {
      const data = fs.readFileSync(dataPath, 'utf8')
      signups = JSON.parse(data)
    } catch (e) {
      // File doesn't exist yet, start with empty array
    }
    
    // Add new submission
    signups.push(submission)
    
    // Save back to file
    fs.writeFileSync(dataPath, JSON.stringify(signups, null, 2))
    
    res.json({ success: true, id: submission.id })
  } else {
    res.json({ error: 'Only POST allowed' })
  }
}
```

**Deploy command**: `npx vercel --prod` (30 seconds)

---

## Option 2: Airtable (Visual + Simple)

### Setup Time: 10 minutes  
### Pros:
- Visual spreadsheet interface
- Easy API
- Can share view with others
- Built-in data validation

### Steps:
1. Create free Airtable account
2. Create base with "Signups" table
3. Get API key from account settings
4. Use their API (one HTTP POST)

```javascript
const response = await fetch('https://api.airtable.com/v0/YOUR_BASE/Signups', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    records: [{
      fields: {
        Name: submission.name,
        Email: submission.email,
        'Creator Types': submission.creatorTypes.join(', '),
        Country: submission.country
      }
    }]
  })
})
```

---

## Option 3: Supabase (I'll Help You Set It Up)

### Setup Time: 15 minutes with guidance
### Pros:
- Real database (PostgreSQL)
- Real-time features  
- Free tier (50k MAU)
- Scales well

### I can walk you through:
1. Create account at supabase.com
2. Create new project (2 minutes)
3. Copy connection details
4. Create table with SQL
5. Test API call

---

## My Recommendation

**For tonight**: Go with **Option 1 (JSON API)**
- Works immediately
- No accounts to create
- Easy to debug
- Can migrate to real database later

**For production**: **Option 3 (Supabase)**
- More robust
- Better for multiple devices
- Real-time capabilities

## Quick Decision

**Want to get working in 5 minutes?** → JSON API (Option 1)  
**Want visual data viewing?** → Airtable (Option 2)  
**Want a real database?** → Supabase (Option 3) - I'll guide you

Which sounds best for getting this working tonight?