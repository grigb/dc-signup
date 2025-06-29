# DC Signup System

An offline-first, progressive signup system for the Distributed Creatives network. Works as both a modal component across websites and a standalone conference registration tool.

## 🚀 Quick Start

### Test Current Version (v1-basic)
1. Open `v1-basic/index.html` in your mobile browser
2. Fill out name and email
3. Tap "Join Now" to save locally
4. Tap "View Stored Data" to see saved entries

### Mobile Testing
```bash
# Serve locally to test on mobile device
python3 -m http.server 8000
# Then visit http://your-ip:8000/v1-basic/ on your phone/iPad
```

## 📋 Development Progress

- ✅ **v1-basic**: Name + email capture with localStorage
- ⏳ **v2-enhanced**: Creator types + improved UX  
- ⏳ **v3-offline**: PWA + IndexedDB + sync queue
- ⏳ **v4-sync**: Backend integration + cloud sync
- ⏳ **v5-complete**: Full features + React components

## 🎯 Features by Version

### v1-basic (Current)
- Simple name/email form
- localStorage persistence  
- Mobile-responsive design
- View/clear stored data
- Form validation

### v2-enhanced (Next)
- Creator type selection
- Country dropdown
- Enhanced validation
- Better mobile UX

### Conference Requirements
- ✅ Works offline on iPad
- ✅ Captures basic info locally
- ⏳ Syncs when online
- ⏳ Conference-specific UI

## 📱 Mobile Testing Instructions

1. **iPhone/iPad**: Open Safari and navigate to the file
2. **Android**: Open Chrome and navigate to the file  
3. **Test offline**: Turn off WiFi after loading page
4. **Verify storage**: Submit form, then refresh page and check "View Stored Data"

## 🛠 Technical Stack

### Current (v1)
- Pure HTML/CSS/JavaScript
- localStorage for persistence
- Responsive CSS design

### Planned (v5)
- React/TypeScript components
- IndexedDB with Dexie.js
- Service Worker for PWA
- Node.js backend with sync
- Tailwind CSS styling

## 📁 Project Structure

```
dc-signup-system/
├── README.md (this file)
├── ROADMAP.md (detailed development plan)
├── v1-basic/
│   └── index.html (current version)
└── [future versions will be added here]
```

## 🔗 Repository

- **GitHub**: https://github.com/grigb/dc-signup-system (private)
- **Live Demo**: Deploy to Vercel for mobile testing

---

**Next Step**: Test v1-basic on your mobile device, then proceed to v2-enhanced development.