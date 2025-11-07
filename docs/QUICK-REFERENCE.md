# Quick Reference Guide

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Firebase Commands

```bash
# Login to Firebase
firebase login

# Initialize project (first time)
firebase init

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only firestore rules
firebase deploy --only firestore:rules

# Deploy only storage rules
firebase deploy --only storage
```

## Git Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Create new branch
git checkout -b feature/your-feature-name

# View git log
git log --oneline -10
```

## Useful Scripts

```bash
# Verify production build
./verify-build.sh

# Check build size
npm run build && du -sh dist/

# Clean node_modules and reinstall
rm -rf node_modules package-lock.json && npm install

# Clear Firebase cache
firebase deploy --only hosting --force
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Common Tasks

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all to latest (be careful!)
npm update

# Update specific package
npm install package-name@latest
```

### Debug Production Build

```bash
# Build and preview
npm run build && npm run preview

# Check console for errors in browser DevTools
# Check Network tab for failed requests
# Check Application > Service Workers for SW status
```

### Clear Cache

```bash
# Clear browser cache
# Chrome: DevTools > Application > Clear Storage
# Or in code: localStorage.clear(), indexedDB.deleteDatabase('curiosity')

# Clear service worker
# DevTools > Application > Service Workers > Unregister
```

### Test PWA Features

```bash
# Check PWA score
# Chrome: DevTools > Lighthouse > Progressive Web App

# Test offline mode
# DevTools > Network > Throttling > Offline

# Test install prompt
# Chrome: Menu > Install Curiosity PWA
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Firebase Deploy Fails

```bash
# Re-login to Firebase
firebase logout
firebase login

# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest
```

### Service Worker Not Updating

```bash
# Force service worker update
# In browser DevTools > Application > Service Workers > Update
# Or unregister and reload

# Clear workbox cache
# Application > Cache Storage > Delete all
```

### Environment Variables Not Working

```bash
# Verify .env file exists
cat .env

# Restart dev server (environment variables load at startup)
# Stop server (Ctrl+C) and run 'npm run dev' again

# For production build
npm run build  # Rebuilds with current .env values
```

## File Locations

```
curiosity-pwa-vite/
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── firebaseConfig.js # Firebase initialization
│   ├── db.js             # IndexedDB setup
│   └── constants.js      # App constants
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   └── manifest.json    # PWA manifest
├── functions/           # Firebase Cloud Functions
├── firebase.json        # Firebase configuration
├── firestore.rules      # Firestore security rules
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Performance Tips

```bash
# Analyze bundle size
npm run build
# Check dist/assets/ for large files

# Use Chrome DevTools Performance tab
# Record > Reload > Analyze

# Check Core Web Vitals
# DevTools > Lighthouse > Performance
```

## Security Checklist

- [ ] .env file is in .gitignore
- [ ] Firebase security rules are deployed
- [ ] API keys are restricted in Firebase Console
- [ ] HTTPS is enabled on production
- [ ] CSP headers are configured
- [ ] Dependencies are up to date (no vulnerabilities)

## Support

- GitHub Issues: https://github.com/ny-collins/curiosity-pwa/issues
- Documentation: See README.md
- Deployment Guide: See DEPLOYMENT.md
- Changelog: See CHANGELOG.md

---

**Last Updated:** November 7, 2025
