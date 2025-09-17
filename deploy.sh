#!/bin/bash

# Enhanced KidsBook Creator - Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 Enhanced KidsBook Creator - Deployment Helper"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project files found"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"

# Create deployment package (excluding node_modules for upload)
echo "📦 Creating deployment package..."
mkdir -p ../deployment-package
cp -r . ../deployment-package/enhanced-kidsbook/
rm -rf ../deployment-package/enhanced-kidsbook/node_modules
rm -rf ../deployment-package/enhanced-kidsbook/.git

echo "✅ Deployment package created at ../deployment-package/"

echo ""
echo "🎯 DEPLOYMENT OPTIONS:"
echo "====================="
echo ""
echo "1. 🔗 VERCEL (Recommended):"
echo "   - Go to https://vercel.com"
echo "   - Click 'New Project'"
echo "   - Import from Git or upload the deployment-package folder"
echo "   - Vercel will auto-detect the settings from vercel.json"
echo ""
echo "2. 🌐 NETLIFY:"
echo "   - Go to https://netlify.com"
echo "   - Drag and drop the deployment-package folder"
echo "   - Settings are configured in netlify.toml"
echo ""
echo "3. 🚂 RAILWAY:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub or upload"
echo "   - Settings are in railway.toml"
echo ""
echo "4. 🐳 DOCKER:"
echo "   - Use the included Dockerfile"
echo "   - Run: docker build -t enhanced-kidsbook ."
echo "   - Run: docker run -p 3000:3000 enhanced-kidsbook"
echo ""
echo "✨ Your enhanced KidsBook Creator is ready for deployment!"
echo "📁 All files are in: ../deployment-package/enhanced-kidsbook/"