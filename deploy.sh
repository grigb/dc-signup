#!/bin/bash

# DC Signup System - Quick Deployment Script
# This ensures fresh deployments and catches cache issues

set -e

echo "🚀 DC Signup System - Quick Deploy"
echo "=================================="

# Get current commit info
CURRENT_COMMIT=$(git log --oneline -1)
echo "📝 Current commit: $CURRENT_COMMIT"

# Push to main branch
echo "📤 Pushing to main branch..."
git push origin main

# Wait a moment for webhook to trigger
echo "⏱️  Waiting for automatic deployment to trigger..."
sleep 10

# Check if we need to force deployment
echo "🔍 If deployment doesn't start in 2 minutes, run:"
echo "   npm run deploy:force"

echo ""
echo "✅ Deployment initiated!"
echo "🌐 Monitor at: https://signup.distributedcreatives.org"
echo "📊 Check deployment logs in Cloudflare Pages dashboard"