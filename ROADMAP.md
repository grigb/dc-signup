# DC Signup System - Development Roadmap

## Project Overview
Building an offline-first, reusable signup system for the Distributed Creatives network that works as both a modal component across websites and a standalone conference registration tool.

## Timeline: Today → Tonight (6+ hours of development)

---

## Phase 1: Basic Local Capture (1-2 hours)
**Goal**: Simple mobile-friendly form that saves locally

### Features
- **Basic form**: Name + Email only
- **Local storage**: Save to device using localStorage
- **Mobile responsive**: Works on phone/iPad  
- **Basic validation**: Required fields, email format
- **View saved data**: Simple list to verify it's working

### Technical Stack
- **HTML/CSS/JavaScript** (no frameworks yet)
- **localStorage** for data persistence
- **Single HTML file** for maximum simplicity

### Deliverables
- `v1-basic/index.html` - Single file app
- Test on mobile device
- Can capture and store name/email locally

---

## Phase 2: Enhanced Form Structure (1-2 hours)
**Goal**: Add creator types and improve UX

### Features  
- **Creator type selection**: Simplified checkboxes (not hierarchical yet)
  - Traditional Arts
  - Technical Creation  
  - Knowledge Creation
  - Design Fields
  - Content Creation
  - Web3 & Digital Assets
  - Other (with text input)
- **Country dropdown**: Basic list of countries
- **Better UI**: Improved styling and layout
- **Form validation**: Enhanced user feedback

### Technical Stack
- **Still single HTML file** (keeping it simple)
- **CSS improvements** for better mobile UX
- **Enhanced JavaScript** for form handling

### Deliverables
- `v2-enhanced/index.html` - Enhanced single file
- Creator type selection working
- Better mobile experience

---

## Phase 3: Offline-First Architecture (1-2 hours)
**Goal**: Add sync capabilities and PWA features

### Features
- **IndexedDB storage**: Replace localStorage with robust offline storage
- **Service Worker**: Basic PWA functionality
- **Sync queue**: Prepare for remote sync
- **Connection detection**: Online/offline status
- **Export functionality**: Manual JSON export option

### Technical Stack
- **Multiple files**: Split into proper structure
- **Service Worker** for offline functionality
- **IndexedDB** with Dexie.js library
- **Webpack or Vite** for bundling

### Deliverables
- `v3-offline/` - Proper file structure
- PWA functionality working
- Offline storage with sync queue

---

## Phase 4: Remote Sync Integration (1-2 hours)
**Goal**: Add backend sync and cloud storage

### Features
- **Simple backend**: Basic Node.js/Express API
- **Background sync**: Auto-sync when online
- **Conflict resolution**: Handle duplicate submissions
- **Admin view**: Simple list of all submissions
- **Data export**: CSV download for organizers

### Technical Stack
- **Backend**: Node.js + Express
- **Database**: JSON file or simple SQLite
- **Deployment**: Vercel or similar
- **API**: RESTful endpoints for CRUD operations

### Deliverables
- `v4-sync/` - Full-stack application
- Backend API deployed
- Automatic sync working

---

## Phase 5: Full Feature Implementation (1-2 hours)  
**Goal**: Complete all specified requirements

### Features
- **Hierarchical creator types**: Full nested selection from existing codebase
- **First 150 Members**: Opt-in with bio text area
- **Modal component**: Reusable component for websites
- **Site branding**: DC logo + site-specific logos
- **Conference mode**: Simplified iPad interface
- **Analytics**: Basic usage tracking

### Technical Stack
- **React components**: Convert to reusable React library
- **TypeScript**: Add type safety  
- **Tailwind CSS**: Professional styling
- **NPM package**: Publishable component library

### Deliverables
- `v5-complete/` - Final implementation
- React component library
- Modal integration examples
- Conference standalone version

---

## Phase 6: Testing & Polish (30 minutes)
**Goal**: Final testing and deployment

### Features
- **Cross-device testing**: Phone, iPad, desktop
- **Error handling**: Comprehensive error states
- **Loading states**: User feedback during operations
- **Documentation**: Integration guide for other sites

### Deliverables
- Tested on multiple devices
- Documentation complete
- Ready for conference use

---

## Development Environment Setup

### Prerequisites
```bash
# Navigate to project
cd dc-signup-system

# Phase 1-2: Just open HTML files in browser
# Phase 3+: Node.js development environment
npm init -y
npm install dexie  # For IndexedDB
npm install express cors  # For backend
```

### Testing Strategy
1. **Mobile-first**: Test every phase on actual mobile device
2. **Incremental**: Each phase builds on previous
3. **Offline testing**: Disable network to verify offline functionality
4. **Conference simulation**: Test iPad interface with multiple users

### Success Criteria
- ✅ Works offline on iPad without internet
- ✅ Captures creator information accurately  
- ✅ Syncs to cloud when connection available
- ✅ Ready for conference use by tonight
- ✅ Reusable across all DC websites

### Emergency Fallbacks
If any phase fails:
1. **Paper forms**: Manual backup for conference
2. **Google Forms**: Simple alternative with offline mode
3. **Previous phase**: Use last working version

---

## File Structure Evolution

```
dc-signup-system/
├── ROADMAP.md (this file)
├── v1-basic/
│   └── index.html
├── v2-enhanced/  
│   └── index.html
├── v3-offline/
│   ├── index.html
│   ├── sw.js
│   ├── app.js
│   └── styles.css
├── v4-sync/
│   ├── frontend/
│   ├── backend/
│   └── deploy/
└── v5-complete/
    ├── src/
    ├── components/
    ├── examples/
    └── package.json
```

**Let's start with Phase 1!** 🚀