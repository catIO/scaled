#!/bin/bash

echo "Clearing macOS PWA cache for Scaled..."

# Remove from Applications if it exists
if [ -d "/Applications/Scaled.app" ]; then
    echo "Removing Scaled.app from Applications..."
    rm -rf "/Applications/Scaled.app"
fi

# Clear Safari PWA cache
echo "Clearing Safari PWA cache..."
rm -rf ~/Library/Containers/com.apple.Safari/Data/Library/Caches/com.apple.Safari/WebKitCache/Version*/CacheStorage/* 2>/dev/null
rm -rf ~/Library/Safari/LocalStorage/*scaled* 2>/dev/null
rm -rf ~/Library/Safari/Databases/*scaled* 2>/dev/null

# Clear Safari website data
echo "Clearing Safari website data..."
rm -rf ~/Library/Safari/LocalStorage/*localhost* 2>/dev/null
rm -rf ~/Library/Safari/Databases/*localhost* 2>/dev/null

# Clear Chrome/Edge PWA data (if exists)
echo "Clearing Chrome/Edge PWA data..."
rm -rf ~/Library/Application\ Support/Google/Chrome/Default/Web\ Applications/*scaled* 2>/dev/null
rm -rf ~/Library/Application\ Support/Microsoft\ Edge/Default/Web\ Applications/*scaled* 2>/dev/null

echo "✅ Cache cleared! Please:"
echo "1. Quit and restart your browser completely"
echo "2. Visit your app URL"
echo "3. You should see a fresh install prompt"

