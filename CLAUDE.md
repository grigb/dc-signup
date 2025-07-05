# DC Signup System - AI Assistant Context

## 🚨 IMMEDIATE AI ASSISTANT INSTRUCTIONS

**READ THIS ENTIRE FILE BEFORE ANY WORK** - This contains project-specific context AND references global AI rules.

### GLOBAL RULES REFERENCE
This project follows the global AI rules defined in `~/.claude/CLAUDE.md`, including:
- Universal standards for code quality, security, and communication
- Mandatory changelog and time tracking requirements
- Platform integration guidelines
- Quality assurance checklists

### PROJECT PRIORITY
- **Deployment Status**: Production-ready, deployed on Cloudflare Pages
- **Priority**: System stability and reliability over new features
- **Critical**: This is a production system. Stability and reliability are more important than new features.

---

## Project Overview
A member signup system with PWA/offline support for Distributed Creatives. This is a production system that needs to be deployed and maintained with stability as the top priority.

## Critical Context
- **Deployment Status**: Production-ready, deployed on Cloudflare Pages
- **Priority**: System stability and reliability over new features
- **Users**: Creative professionals joining Distributed Creatives community

## Tech Stack & Architecture

### Frontend
- **Framework**: Vanilla JavaScript (no React/Vue/Angular)
- **Styling**: Plain CSS with CSS variables
- **PWA**: Service worker for offline support
- **Storage**: IndexedDB for offline data, localStorage for config

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Edge Functions**: Supabase Functions

### Deployment
- **Hosting**: Cloudflare Pages
- **Domain**: distributedcreatives.com
- **SSL**: Cloudflare managed

## Project Structure
```
/dc-signup-system/
├── src/                    # Source files
│   ├── index.html         # Landing page
│   ├── admin.html         # Admin dashboard
│   ├── member.html        # Member dashboard
│   ├── verify.html        # Email verification
│   ├── *.js               # JavaScript modules
│   └── assets/            # Icons, manifest, etc.
├── dist/                   # Build output (copy of src)
├── database/              # SQL schemas and migrations
├── docs/                  # Documentation
│   ├── changelogs/        # Change tracking (per global rules)
│   └── time-logs/         # Time tracking data
├── tests/                 # Test files
└── supabase/             # Supabase functions
```

## Key Features
1. **Offline-First**: Full functionality without internet
2. **Member Signup**: Multi-step form with validation
3. **Admin Dashboard**: Member management and approvals
4. **Email Verification**: Secure member onboarding
5. **PWA Support**: Installable as app on mobile/desktop

## Important Files
- `src/config.template.js` - Configuration template
- `src/js/offline-manager.js` - Offline sync logic
- `src/js/form-handler.js` - Form validation and submission
- `src/sw.js` - Service worker for PWA

## Development Guidelines

### Code Style (Project-Specific + Global Standards)
- Use ES6+ JavaScript features
- Async/await for asynchronous operations
- Meaningful variable and function names
- Comment complex logic
- **From Global**: Write self-documenting code
- **From Global**: Implement proper error handling with user feedback
- **From Global**: Follow security-first approach

### Testing
- Manual testing for all user flows
- Playwright E2E tests in `/tests/e2e/`
- Test offline scenarios thoroughly
- **From Global**: Include unit tests for all functionality
- **From Global**: Test security implications

### Security (Enhanced with Global Standards)
- Input validation on client and server
- Parameterized queries only
- No sensitive data in client code
- Environment variables for secrets
- **From Global**: Validate and sanitize ALL external inputs
- **From Global**: Implement proper session management
- **From Global**: Don't expose sensitive info in error messages
- **From Global**: Log security events (but never sensitive data)

### Performance
- Lazy load non-critical resources
- Minimize API calls
- Cache static assets aggressively
- Optimize images before deployment
- **From Global**: Profile before optimizing
- **From Global**: Focus on algorithmic improvements

## 🚨 PRODUCTION SAFETY RULES

### File Organization (ENFORCED)
- NO test files in src/ - use tests/manual/
- NO new files unless critical - edit existing first
- NO documentation outside docs/

### Pre-Deploy Checklist
[ ] Move any test-*.* files out of src/
[ ] Test signup flow with existing email
[ ] Check browser console for errors
[ ] Verify dist/ matches src/ after build
[ ] Config uses environment variables

## Common Tasks

### Running Locally
```bash
# Install dependencies
npm install

# Start local server (runs on port 4100)
npm run dev

# Run tests
npm test
```

### 🚨 DEVELOPMENT SERVER CONFIGURATION
- **Port**: 4100 (ALWAYS use this port for local development)
- **URL**: http://localhost:4100
- **Server**: Python's built-in HTTP server (`python3 -m http.server 4100`)
- **Directory**: Serves files from `src/` directory
- **Command**: `npm run dev` (defined in package.json)

**IMPORTANT FOR AI ASSISTANTS**: 
- NEVER assume port 3000 or other common ports
- ALWAYS check `package.json` scripts section first
- Use `lsof -i :4100` to verify if server is already running
- The dev server may already be running from previous sessions

### Deployment
```bash
# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

### Database Updates
- All schema changes in `/database/migrations/`
- Test migrations locally first
- Always backup before production changes

## Current Status & Priorities

### Working Features
- Member signup flow
- Admin approval system
- Email verification
- Offline data sync
- PWA installation

### Known Issues
- Check `/docs/CHANGELOG.md` for latest updates
- Monitor error logs in production

### Do NOT
- Add new frameworks or major dependencies
- Refactor working code without reason
- Change database schema without migration
- Deploy untested code to production
- **From Global**: Skip changelog/time tracking for changes
- **From Global**: Create files unless absolutely necessary

### DO
- Test all changes thoroughly
- Maintain backward compatibility
- Document any changes
- Keep the system stable
- Focus on user experience
- **From Global**: Create changelog entries for ALL changes
- **From Global**: Track time for all tasks
- **From Global**: Follow security protocols
- **From Global**: Prefer editing existing files

## 📝 MANDATORY REQUIREMENTS (From Global Rules)

### Changelog Requirements
**ALL changes must have changelog entries in**: `/docs/changelogs/YY-MM-DD-hh-mm-[Tool]-[Summary].md`

### Time Tracking Requirements
- Estimate time before starting tasks
- Track actual time spent
- Update `/docs/time-logs/task-history.json`
- Calculate estimate accuracy

### Quality Checklist (Before Any Code Delivery)
- [ ] Follows JavaScript/ES6+ conventions
- [ ] Implements proper error handling
- [ ] Includes appropriate tests
- [ ] Has clear documentation
- [ ] Considers security implications
- [ ] Optimized for performance where relevant
- [ ] Accessible and user-friendly
- [ ] Changelog entry created
- [ ] Time data logged

## Support & Resources
- Supabase Dashboard: [project URL]
- Cloudflare Dashboard: [project URL]
- Error Monitoring: Check browser console and Supabase logs
- Global AI Rules: `~/.claude/CLAUDE.md`

## Emergency Contacts
- Technical issues: [contact info]
- Deployment help: [contact info]

---
**Remember**: This is a production system. Stability and reliability are more important than new features. Always follow both project-specific guidelines AND global AI rules.

***** CLAUDE CONFIGURED *****