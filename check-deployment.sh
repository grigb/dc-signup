#!/bin/bash

# DC Signup System - Deployment Checker
# Verifies the live site matches local changes

set -e

echo "🔍 DC Signup System - Deployment Checker"
echo "========================================"

# Get current commit
LOCAL_COMMIT=$(git log --oneline -1)
echo "📝 Local commit: $LOCAL_COMMIT"

# Check what's on the live site
echo "🌐 Checking live site..."
LIVE_TITLE=$(curl -s https://signup.distributedcreatives.org/ | grep -o '<title>[^<]*</title>' | head -1)
echo "🏷️  Live site title: $LIVE_TITLE"

# Expected title
EXPECTED_TITLE="<title>Join Distributed Creatives</title>"

if [[ "$LIVE_TITLE" == "$EXPECTED_TITLE" ]]; then
    echo "✅ Live site appears to be updated!"
else
    echo "❌ Live site may not be updated yet"
    echo "   Expected: $EXPECTED_TITLE"
    echo "   Got:      $LIVE_TITLE"
    echo ""
    echo "🔄 Try running: npm run deploy:force"
fi

echo ""
echo "📊 Check deployment logs in Cloudflare Pages dashboard"
echo "🌐 Site: https://signup.distributedcreatives.org"