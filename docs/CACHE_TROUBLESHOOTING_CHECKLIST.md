# 🚨 Service Worker Cache Troubleshooting - Quick Reference

## Is The Fix Not Showing Up? Check This List:

### 1. ✅ Did You Edit The Right Files?
```bash
# ❌ WRONG: Editing dist/ directly
vim dist/index.html  

# ✅ CORRECT: Edit src/ files
vim src/index.html
```

### 2. ✅ Did You Run The Build?
```bash
npm run build
# This copies src/ → dist/
```

### 3. ✅ Did You Update Service Worker Version?
```javascript
// In src/sw.js
const CACHE_NAME = 'dc-genesis-v4'  // Bump this number!
```

### 4. ✅ Quick Verification Commands
```bash
# Check if build ran correctly
diff src/index.html dist/index.html

# Check service worker version
grep "CACHE_NAME" dist/sw.js

# Check file timestamps
ls -la src/sw.js dist/sw.js
```

## 🔥 Emergency: Users Still See Old Version?

### For Developers:
1. **Check browser console**:
   ```javascript
   // What service worker version is active?
   navigator.serviceWorker.controller.scriptURL
   
   // What caches exist?
   caches.keys()
   ```

2. **Force update**:
   - Bump cache version significantly (e.g., v99)
   - Add `skipWaiting()` if not present
   - Deploy immediately

### Tell Users To:
1. **Windows**: Ctrl + Shift + R
2. **Mac**: Cmd + Shift + R  
3. **Last Resort**: Clear browser data for this site

## 📋 Pre-Deployment Checklist

- [ ] Made changes in `src/` (not `dist/`)
- [ ] Updated `CACHE_NAME` version in `src/sw.js`
- [ ] Ran `npm run build`
- [ ] Verified with `diff src/ dist/`
- [ ] Tested in incognito window
- [ ] Ready to deploy!

## 🐛 Common Mistakes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Changes not showing | Forgot to run build | `npm run build` |
| Service worker not updating | Didn't bump cache version | Update `CACHE_NAME` |
| Only some users affected | Old service worker cached | Force version bump |
| Works locally, not in production | Different cache strategies | Check sw.js deployment |

## 💡 Remember

**The Golden Rule**: If users can't see your changes, it's probably a caching issue!

1. **Always** work in `src/`
2. **Always** run build before deploy
3. **Always** bump service worker version
4. **Always** test in incognito mode

---
*Keep this handy! Service worker caching issues can be frustrating but are easy to fix once you know what to look for.*