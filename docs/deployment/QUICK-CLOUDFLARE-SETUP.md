# 🚀 Cloudflare Pages - 5 Minute Setup

## ✅ Everything Ready for Deployment
All production files prepared in `/cloudflare-deploy/` directory:
- Enhanced HTML with SEO & security
- PWA manifest optimized 
- Security headers configured
- GitHub repo ready at `grigb/dc-signup`

## 📋 Complete Setup Steps

### 1. Create Cloudflare Pages Project
1. **Login**: Go to https://dash.cloudflare.com/
2. **Navigate**: Click **"Pages"** in left sidebar
3. **Create**: Click **"Create a project"** → **"Connect to Git"**
4. **Connect**: Choose **GitHub** → Select `grigb/dc-signup`

### 2. Configure Build Settings
```
Project name: dc-genesis-signup
Production branch: main
Build directory: cloudflare-deploy
Build command: (leave empty)
Build output directory: /
```

### 3. Set Environment Variables (Pages Settings)
```
SUPABASE_URL=https://URL_HERE.supabase.co
SUPABASE_ANON_KEY=KEY_HERE...
```

### 4. Configure Custom Domain
1. Project Settings → **"Custom domains"**
2. **"Set up a custom domain"** → Enter: `signup.distributedcreatives.org`
3. Cloudflare auto-configures DNS (domain already managed)

## 🌐 Expected Results
- **Production URL**: `https://signup.distributedcreatives.org`
- **Cloudflare URL**: `https://dc-genesis-signup.pages.dev`
- **Deploy Time**: ~30 seconds
- **Global CDN**: Instant worldwide availability

## 🎯 Ready for Conference Next Week!
After deployment, the signup system will be:
- ✅ Fully offline-capable for conference booth
- ✅ Mobile-optimized for iPad interface
- ✅ Auto-syncing when connection returns
- ✅ Production-ready with security headers

---
**Next**: Complete Cloudflare setup, then test production URL