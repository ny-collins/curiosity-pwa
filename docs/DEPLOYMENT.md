# Production Deployment Checklist

## ✅ Pre-Deployment

- [x] Remove debug console.log statements
- [x] Update package.json version to 1.0.0
- [x] Verify build succeeds without errors
- [x] Clean up commented code
- [x] Update .gitignore with comprehensive patterns
- [x] Create .env.example for environment variables

## 🔧 Environment Setup

- [ ] Create production Firebase project
- [ ] Set up Firebase Authentication
  - [ ] Enable Google Sign-in
  - [ ] Configure authorized domains
- [ ] Set up Firestore Database
  - [ ] Deploy security rules from `firestore.rules`
  - [ ] Create indexes from `firestore.indexes.json`
- [ ] Set up Firebase Storage
  - [ ] Deploy storage rules
  - [ ] Create `/users/{userId}/` structure
- [ ] Set up Firebase Cloud Functions (if using)
  - [ ] Deploy functions from `functions/` directory
- [ ] Configure Firebase Hosting
  - [ ] Set up custom domain (optional)
  - [ ] Configure SSL certificates

## 🔐 Security Configuration

- [ ] Update Firebase security rules
- [ ] Enable App Check (recommended)
- [ ] Configure CORS for Cloud Storage
- [ ] Set up rate limiting (if needed)
- [ ] Review and restrict API keys

## 📱 PWA Configuration

- [ ] Verify `manifest.json` is correct
  - [ ] Update app name
  - [ ] Verify theme colors
  - [ ] Check icon paths
- [ ] Test service worker registration
- [ ] Verify offline functionality
- [ ] Test install prompts on mobile
- [ ] Verify push notifications (if enabled)

## 🎨 Branding & Assets

- [ ] Replace icons in `public/icons/` with your branding
  - [ ] icon-192x192.png
  - [ ] icon-512x512.png
  - [ ] icon-144x144.png
- [ ] Update favicon.svg
- [ ] Update apple-touch-icon.png
- [ ] Update logo.svg

## 🧪 Testing

- [ ] Test on Chrome (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Chrome (mobile)
- [ ] Test on Safari (iOS)
- [ ] Test offline mode
- [ ] Test PIN lock functionality
- [ ] Test biometric authentication
- [ ] Test data export features
- [ ] Test cloud sync
- [ ] Test responsive design (375px, 768px, 1024px+)

## 🚀 Deployment

### Option 1: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (if not done)
firebase init hosting

# Build production bundle
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

## 📊 Post-Deployment

- [ ] Verify app loads correctly in production
- [ ] Test install prompt on mobile
- [ ] Check service worker updates
- [ ] Monitor Firebase Analytics
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Test all API endpoints
- [ ] Verify environment variables are set

## 🔄 Updates & Maintenance

- [ ] Set up CI/CD pipeline (GitHub Actions, etc.)
- [ ] Create staging environment
- [ ] Document version control strategy
- [ ] Set up automated testing
- [ ] Create backup strategy for user data

## 📝 Documentation

- [ ] Update README.md with live URL
- [ ] Document API endpoints (if any)
- [ ] Create user guide
- [ ] Add changelog
- [ ] Document environment variables

## 🎉 Launch

- [ ] Announce on social media
- [ ] Submit to PWA directories
- [ ] Add to Google Play Store (via TWA)
- [ ] Share with beta testers
- [ ] Gather user feedback

---

## Quick Deploy Commands

### Build and Deploy to Firebase
```bash
npm run build && firebase deploy
```

### Build and Preview
```bash
npm run build && npm run preview
```

### Check Build Size
```bash
npm run build
# Check dist/ folder size
du -sh dist/
```

## Environment Variables Required

Make sure these are set in your hosting platform:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx
```

## Performance Tips

- Enable compression on hosting platform
- Use CDN for static assets
- Enable caching headers
- Monitor Core Web Vitals
- Optimize images with WebP format
- Consider using a service worker cache-first strategy for assets

## Support

For issues during deployment, check:
- Firebase Console logs
- Browser console for errors
- Network tab for failed requests
- Service worker status in DevTools
