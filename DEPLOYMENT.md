# DC Signup System - Deployment Guide

## 🚀 Quick Start

Use these commands for all deployments:

```bash
# Normal deployment (preferred)
npm run deploy

# If deployment gets stuck on old commit  
npm run deploy:force

# Check if live site matches your changes
npm run deploy:check
```

## 📋 Daily Workflow

1. **Make your changes** locally
2. **Test locally** with `npm run dev` (http://localhost:4100)
3. **Test on mobile** with `npm run dev:mobile` (shows IP for phone testing)
4. **Deploy** with `npm run deploy`
5. **Verify** with `npm run deploy:check`
6. **If issues**, use `npm run deploy:force`

## 🔧 Deployment Commands

### `npm run deploy` - Normal Deployment
- Pushes changes to main branch
- Waits for automatic Cloudflare Pages deployment
- Shows instructions if deployment doesn't start
- **Use this for most deployments**

### `npm run deploy:force` - Emergency Deployment
- Creates trigger commit to force fresh deployment
- Pushes to main branch
- **Immediately triggers webhook** for instant deployment
- **Use when automatic deployment is stuck on old commit**

### `npm run deploy:check` - Verification
- Checks if live site title matches expected
- Compares local commit with deployed version
- Tells you if you need to force deploy
- **Use to verify deployment success**

## 🔍 Monitoring Deployments

### Always Check These:
1. **Deployment logs** in Cloudflare Pages dashboard
2. **Commit hash** in logs should match your latest: `git log --oneline -1`
3. **Live site** at https://signup.distributedcreatives.org

### Signs of Problems:
- ❌ **Wrong commit hash** in deployment logs
- ❌ **Old content** on live site (like "Join Genesis Members")
- ❌ **Build failures** or "dist not found" errors

### Quick Fixes:
- **Wrong commit**: `npm run deploy:force`
- **Build failures**: Check wrangler.toml and dashboard settings
- **Old content**: Clear browser cache + `npm run deploy:force`

## 🏗️ System Architecture

### Cloudflare Pages Settings:
- **Production branch**: `main`
- **Root directory**: `/` (project root)
- **Build command**: `npm run build`
- **Build output**: `dist`

### Deploy Hook:
- **Webhook URL**: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/36cad9a3-361b-40de-825c-399797376fb4`
- **Purpose**: Force immediate deployment when automatic deployment is stuck
- **Triggered by**: `npm run deploy:force`

### Local Build Process:
- `npm run build` copies `src/` to `dist/`
- Cloudflare Pages deploys from `dist/` directory
- Live site serves from Cloudflare's global CDN

## 🚨 Common Issues & Solutions

### Issue: Deployment Stuck on Old Commit
**Symptoms**: Deployment logs show wrong commit hash
**Solution**: `npm run deploy:force`
**Prevention**: Always check commit hash in deployment logs

### Issue: "dist not found" Error
**Symptoms**: Build fails with "Output directory 'dist' not found"
**Solution**: Check Cloudflare Pages dashboard settings:
- Build command: `npm run build`
- Build output: `dist`
- Root directory: `/`

### Issue: Live Site Shows Old Content
**Symptoms**: Site still shows "Join Genesis Members" instead of "Join Distributed Creatives"
**Solution**: 
1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
2. `npm run deploy:force`
3. Wait 2-3 minutes for global CDN update

### Issue: Build Script Missing
**Symptoms**: "Missing script: build" error
**Solution**: Ensure `package.json` has:
```json
"scripts": {
  "build": "rm -rf dist && cp -R src dist"
}
```

## 🔄 Emergency Procedures

### If Deployment System is Broken:
1. **Manual deployment** in Cloudflare Pages dashboard
2. **Check webhook** is correctly configured
3. **Verify build settings** match this guide
4. **Contact support** if webhook fails

### If Site is Down:
1. **Check Cloudflare Pages status** 
2. **Verify latest deployment** succeeded
3. **Check for DNS issues**
4. **Use deployment checker**: `npm run deploy:check`

## 👥 For AI Agents

### When Making Changes:
1. **Always test locally** first with `npm run dev`
2. **Use `npm run deploy`** for normal deployments
3. **Monitor deployment logs** for correct commit hash
4. **Use `npm run deploy:force`** if deployment is stuck
5. **Verify with `npm run deploy:check`** after deployment

### Key Files:
- `deploy.sh` - Normal deployment script
- `deploy-force.sh` - Emergency deployment with webhook
- `check-deployment.sh` - Verification script
- `wrangler.toml` - Cloudflare Pages configuration
- `package.json` - Build scripts and npm commands

### Critical Settings:
- **Never change** the wrangler.toml format
- **Always push to main branch** for production
- **Check commit hash** in deployment logs
- **Use webhook** when automatic deployment fails

## 📚 Reference

### Live Site:
- **URL**: https://signup.distributedcreatives.org
- **Expected title**: "Join Distributed Creatives"
- **Local development**: http://localhost:4100

### Repository:
- **GitHub**: https://github.com/grigb/dc-signup
- **Main branch**: `main`
- **Deployment branch**: `main`

### Cloudflare Pages:
- **Project**: dc-signup
- **Build system**: Version 3
- **Node.js**: 22.16.0
- **npm**: 10.9.2

---

**Remember**: This system is designed to prevent deployment cache issues. When in doubt, use `npm run deploy:force` to guarantee fresh deployment.