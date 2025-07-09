#!/bin/bash

# DC Signup System - Force Deployment Script
# Use this when automatic deployment is stuck on old commit

set -e

echo "🆘 DC Signup System - Force Deploy"
echo "=================================="

# Get current commit info
CURRENT_COMMIT=$(git log --oneline -1)
echo "📝 Current commit: $CURRENT_COMMIT"

# Create trigger commit
echo "🔄 Creating trigger commit to force fresh deployment..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "# Deployment trigger: $TIMESTAMP" >> .deployment-trigger
git add .deployment-trigger
git commit -m "Force deployment trigger - $TIMESTAMP"

# Push to main
echo "📤 Pushing trigger commit..."
git push origin main

# Trigger webhook for immediate deployment
echo "🔗 Triggering webhook for immediate deployment..."
curl -d "" "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/36cad9a3-361b-40de-825c-399797376fb4"

echo ""
echo "✅ Force deployment triggered!"
echo "🌐 Monitor at: https://signup.distributedcreatives.org"
echo "📊 Check deployment logs show commit: $(git log --oneline -1)"