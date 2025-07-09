# DC Signup System

An offline-first Progressive Web App (PWA) for member signup and management in the Distributed Creatives network. Features full offline support, email verification, and admin tools.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev              # Start local development server
```

### Production Build & Deploy
```bash
npm run build            # Copies src/ to dist/
npm run deploy          # Deploy to Cloudflare Pages
```

### Testing
```bash
npm test                # Run Playwright E2E tests
```

## 📋 Current Status

**Production Ready** - The system is deployed and operational on Cloudflare Pages with:
- ✅ Complete member signup flow with validation
- ✅ Offline-first PWA functionality  
- ✅ Email verification system
- ✅ Admin dashboard for member management
- ✅ Automatic data sync when online

## 🎯 Key Features

### Member Experience
- Multi-step signup form with creator type selection
- Works completely offline (PWA installable)
- Email verification for account activation
- Personal dashboard to view/edit profile

### Admin Features
- Member management dashboard
- Approve/reject applications
- View member details and status
- Export member data

### Technical Features
- Progressive Web App (installable on mobile/desktop)
- IndexedDB for offline data storage
- Service Worker for offline functionality
- Automatic sync queue for offline changes
- Supabase backend integration

## 📱 Mobile/PWA Installation

1. **iPhone/iPad**: Open in Safari → Share → Add to Home Screen
2. **Android**: Open in Chrome → Three dots → Install app
3. **Desktop**: Click install icon in address bar (Chrome/Edge)

## 🛠 Technical Stack

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3 with CSS Variables
- Service Worker for offline support
- IndexedDB for local storage

### Backend
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Supabase Storage for file uploads
- Edge Functions for email sending

### Deployment
- Cloudflare Pages (hosting)
- Custom domain support
- SSL/HTTPS enabled

## 📁 Project Structure

```
dc-signup-system/
├── src/                    # Source files
│   ├── index.html         # Landing/signup page
│   ├── admin.html         # Admin dashboard
│   ├── member.html        # Member dashboard
│   ├── verify.html        # Email verification
│   ├── assets/            # Icons, manifest, etc.
│   └── sw.js              # Service worker
├── dist/                   # Build output
├── database/              # SQL schemas and migrations
│   ├── schemas/           # Database schemas
│   ├── migrations/        # Database migrations
│   └── functions/         # SQL functions
├── docs/                  # Documentation
│   ├── deployment/        # Deployment guides
│   ├── architecture/      # System architecture
│   └── CHANGELOG.md       # Version history
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests
│   └── manual/           # Manual test scripts
└── supabase/             # Supabase functions
```

## 🔗 Repository

- **GitHub**: https://github.com/grigb/dc-signup-system (private)
- **Live Demo**: Deploy to Vercel for mobile testing

---

**Next Step**: Test v1-basic on your mobile device, then proceed to v2-enhanced development.# Force deployment trigger
