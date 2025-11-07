#!/bin/bash

# Production Build Verification Script
# Run this before deploying to production

echo "🚀 Curiosity PWA - Production Build Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"
if [[ "$NODE_VERSION" < "v18" ]]; then
    echo -e "${RED}❌ Node.js 18+ required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js version OK${NC}"
echo ""

# Check if .env file exists
echo "🔐 Checking environment variables..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Please create .env file using .env.example as template"
    exit 1
fi
echo -e "${GREEN}✓ .env file found${NC}"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Run build
echo "🔨 Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Check build size
echo "📊 Analyzing build size..."
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    echo "Total build size: $BUILD_SIZE"
    
    # Check if build is too large (> 10MB is concerning)
    BUILD_SIZE_MB=$(du -sm dist/ | cut -f1)
    if [ "$BUILD_SIZE_MB" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Build size is large (> 10MB)${NC}"
        echo "Consider code splitting or removing unused dependencies"
    else
        echo -e "${GREEN}✓ Build size is reasonable${NC}"
    fi
    echo ""
    
    # List main assets
    echo "Main assets:"
    ls -lh dist/assets/*.js 2>/dev/null | awk '{print "  " $9 " - " $5}' | head -5
    echo ""
else
    echo -e "${RED}❌ dist/ folder not found${NC}"
    exit 1
fi

# Check for required files
echo "🔍 Checking required files..."
REQUIRED_FILES=("dist/index.html" "dist/manifest.webmanifest" "dist/sw.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        exit 1
    fi
done
echo ""

# Check Firebase configuration
echo "🔥 Checking Firebase configuration..."
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✓ firebase.json found${NC}"
else
    echo -e "${YELLOW}⚠️  firebase.json not found (required for Firebase deployment)${NC}"
fi
echo ""

# Preview build
echo "👀 Starting preview server..."
echo "Run 'npm run preview' to test the production build locally"
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}✅ Production build verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run preview"
echo "2. Deploy to Firebase: firebase deploy"
echo "3. Or deploy to Vercel: vercel --prod"
echo "4. Or deploy to Netlify: netlify deploy --prod --dir=dist"
echo ""
echo "See DEPLOYMENT.md for detailed deployment instructions"
echo "================================================"
