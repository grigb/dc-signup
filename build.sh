#!/bin/bash

# Cloudflare Pages build script
# This script replaces environment variable placeholders with actual values

echo "Starting build process..."

# Create build directory
mkdir -p dist

# Copy all files to build directory
cp -r src/* dist/

# Replace environment variable placeholders in the HTML file
if [ ! -z "$SUPABASE_URL" ] && [ ! -z "$SUPABASE_ANON_KEY" ]; then
    echo "Injecting environment variables..."
    sed -i '' "s|__SUPABASE_URL__|$SUPABASE_URL|g" dist/index.html
    sed -i '' "s|__SUPABASE_ANON_KEY__|$SUPABASE_ANON_KEY|g" dist/index.html
    echo "Environment variables injected successfully"
else
    echo "WARNING: Environment variables not found. App will run in offline-only mode."
fi

echo "Build completed successfully"