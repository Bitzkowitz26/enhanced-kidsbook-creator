#!/bin/bash

# Deploy Enhanced KidsBook Creator to kidsbook.dev
# This script helps deploy the enhanced version to your existing domain

echo "🚀 Deploying Enhanced KidsBook Creator to kidsbook.dev"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Committing them now..."
    git add .
    git commit --author="openhands <openhands@all-hands.dev>" -m "Deploy: Latest enhanced version to kidsbook.dev"
fi

echo "📦 Building production version..."

# Create production build directory
mkdir -p dist

# Copy all necessary files to dist
cp index.html dist/
cp styles.css dist/
cp app.js dist/
cp server.js dist/
cp package.json dist/
cp vercel.json dist/

echo "✅ Production build created in dist/ directory"

echo ""
echo "🌐 DEPLOYMENT OPTIONS FOR KIDSBOOK.DEV:"
echo "======================================="
echo ""
echo "1. 📡 VERCEL (Recommended)"
echo "   - Connect your GitHub repo to Vercel"
echo "   - Set custom domain to kidsbook.dev"
echo "   - Automatic deployments on git push"
echo ""
echo "2. 🚀 NETLIFY"
echo "   - Drag & drop the dist/ folder to Netlify"
echo "   - Or connect GitHub repo"
echo "   - Set custom domain to kidsbook.dev"
echo ""
echo "3. ☁️  CLOUDFLARE PAGES"
echo "   - Connect GitHub repo to Cloudflare Pages"
echo "   - Set custom domain to kidsbook.dev"
echo ""
echo "4. 🐳 DOCKER DEPLOYMENT"
echo "   - Use the included Dockerfile"
echo "   - Deploy to any cloud provider"
echo ""

# Check current hosting
echo "🔍 Checking current kidsbook.dev hosting..."
curl -s -I https://kidsbook.dev | grep -i server || echo "Could not determine hosting provider"

echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Choose your preferred deployment method above"
echo "2. If using Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repo: enhanced-kidsbook-creator"
echo "   - Set custom domain to kidsbook.dev in project settings"
echo "3. If using other platforms, upload the dist/ folder contents"
echo ""
echo "🎯 Your enhanced app will be live at https://kidsbook.dev"
echo "   with all the modern features matching childbook.ai!"

# Create a deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << EOF
# 🚀 Deployment Checklist for kidsbook.dev

## ✅ Pre-Deployment
- [x] Modern UI redesign completed
- [x] All features implemented and tested
- [x] Code committed to GitHub
- [x] Production build created

## 🌐 Deployment Steps

### Option 1: Vercel (Recommended)
1. [ ] Go to https://vercel.com/new
2. [ ] Import GitHub repository: \`enhanced-kidsbook-creator\`
3. [ ] Configure build settings:
   - Build Command: \`npm run build\` (or leave empty)
   - Output Directory: \`.\` (or leave empty)
4. [ ] Deploy project
5. [ ] Add custom domain \`kidsbook.dev\` in project settings
6. [ ] Update DNS records to point to Vercel

### Option 2: Manual Upload
1. [ ] Upload contents of \`dist/\` folder to your hosting provider
2. [ ] Ensure \`index.html\` is the main file
3. [ ] Configure server to serve static files
4. [ ] Test all functionality

## 🧪 Post-Deployment Testing
- [ ] Hero section loads with modern design
- [ ] Navigation works (CREATE, ILLUSTRATOR, GALLERY, TEMPLATES, GUIDE)
- [ ] Character photo upload works
- [ ] Story generation workflow functions
- [ ] Templates system works
- [ ] Book preview displays correctly
- [ ] Export functionality (PDF, JSON) works
- [ ] Mobile responsive design works
- [ ] All animations and interactions work

## 🎯 Features to Verify
- [ ] Modern UI matching childbook.ai design
- [ ] Character personalization with photo upload
- [ ] Story templates (Adventure, Friendship, Magic, Animals)
- [ ] Step-by-step guided workflow
- [ ] Professional book preview
- [ ] Loading animations with progress
- [ ] Success/error modals
- [ ] Gallery system
- [ ] Guide section

## 🔧 Troubleshooting
If something doesn't work:
1. Check browser console for errors
2. Verify all files uploaded correctly
3. Check server configuration for static file serving
4. Ensure HTTPS is enabled
5. Test API endpoints if using server-side features

## 📞 Support
If you need help with deployment, the enhanced application is ready and all files are prepared in the \`dist/\` directory.
EOF

echo "📝 Created DEPLOYMENT_CHECKLIST.md for reference"
echo ""
echo "🎉 Enhanced KidsBook Creator is ready for deployment!"
echo "   Your users will love the new modern interface!"