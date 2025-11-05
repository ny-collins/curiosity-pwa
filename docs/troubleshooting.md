# Troubleshooting Guide

This guide helps you resolve common issues when developing, deploying, or using Curiosity PWA. If you can't find a solution here, please check the [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues) or create a new issue.

## Development Issues

### Build & Compilation Errors

#### "Module not found" errors
**Symptoms:** Build fails with module resolution errors.

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For functions
cd functions && rm -rf node_modules package-lock.json && npm install && cd ..

# Check if file exists
ls -la src/components/Button.jsx
```

#### TypeScript/ESLint errors
**Symptoms:** Linting fails with type or style errors.

**Solutions:**
```bash
# Fix linting issues automatically
npm run lint:fix

# Check specific file
npx eslint src/components/Button.jsx

# Update ESLint configuration if needed
# Edit .eslintrc.js or eslint.config.js
```

#### Vite build failures
**Symptoms:** `npm run build` fails with bundling errors.

**Solutions:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check for circular dependencies
npx vite build --mode development

# Verify environment variables
cat .env
```

### Firebase Issues

#### Authentication not working
**Symptoms:** Sign-in fails or user state not updating.

**Solutions:**
```bash
# Check Firebase configuration
cat .env | grep VITE_FIREBASE

# Verify Firebase project
firebase projects:list

# Check authentication logs
firebase functions:log --only auth
```

#### Functions deployment fails
**Symptoms:** `firebase deploy --only functions` fails.

**Solutions:**
```bash
# Check function syntax
cd functions && node -c index.js && cd ..

# Verify Firebase config
firebase functions:config:get

# Check function logs
firebase functions:log --only generateRegistrationOptions
```

#### Firestore queries failing
**Symptoms:** Data not loading or saving.

**Solutions:**
```bash
# Check security rules
firebase deploy --only firestore:rules

# Verify data structure
# Firebase Console → Firestore → Check documents

# Test with Firebase emulator
firebase emulators:start --only firestore
```

### PWA & Service Worker Issues

#### Service worker not registering
**Symptoms:** PWA features not working, no offline support.

**Solutions:**
```javascript
// Check service worker registration in browser DevTools
// Application → Service Workers

// Clear service worker cache
// Application → Storage → Clear storage

// Rebuild and redeploy
npm run build
firebase deploy --only hosting
```

#### PWA not installable
**Symptoms:** No install prompt on supported browsers.

**Solutions:**
```json
// Check web app manifest
{
  "name": "Curiosity PWA",
  "short_name": "Curiosity",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF"
}
```

#### Offline functionality broken
**Symptoms:** App doesn't work offline.

**Solutions:**
```bash
# Check IndexedDB in DevTools
// Application → IndexedDB → Check data

# Verify service worker cache
// Application → Cache → Cache Storage

# Test offline mode
// Network → Offline
```

## Runtime Issues

### Browser Compatibility

#### WebAuthn not supported
**Symptoms:** Biometric authentication fails.

**Solutions:**
```javascript
// Check WebAuthn support
if (window.PublicKeyCredential) {
  console.log('WebAuthn supported');
} else {
  console.log('WebAuthn not supported');
}

// Use HTTPS (required for WebAuthn)
location.protocol === 'https:'
```

#### CSS not loading properly
**Symptoms:** Styling issues, layout broken.

**Solutions:**
```css
/* Check CSS custom properties */
:root {
  --color-primary: #3B82F6;
  --color-bg-base: #FFFFFF;
}

/* Verify TailwindCSS loading */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

### Mobile Issues

#### Touch events not working
**Symptoms:** Buttons not responding on mobile.

**Solutions:**
```javascript
// Use touch-friendly event listeners
<button
  onClick={handleClick}
  onTouchStart={handleTouchStart}
  className="min-h-[44px] min-w-[44px]" // Minimum touch target size
>
  Click me
</button>
```

#### Viewport issues
**Symptoms:** Layout not responsive on mobile.

**Solutions:**
```html
<!-- Check viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Test responsive breakpoints -->
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive content
</div>
```

### Performance Issues

#### Slow initial load
**Symptoms:** App takes long to load.

**Solutions:**
```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npx vite-bundle-analyzer dist

# Implement code splitting
const Component = lazy(() => import('./Component'));
```

#### Memory leaks
**Symptoms:** App performance degrades over time.

**Solutions:**
```javascript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Clean up subscriptions
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // Handle updates
  });

  return unsubscribe;
}, []);
```

## Deployment Issues

### Firebase Hosting Problems

#### Custom domain not working
**Symptoms:** Custom domain shows default Firebase page.

**Solutions:**
```bash
# Check DNS records
dig yourdomain.com

# Verify domain in Firebase Console
# Hosting → Domains → Check verification status

# Wait for SSL certificate (can take 24-48 hours)
```

#### Hosting deployment fails
**Symptoms:** `firebase deploy --only hosting` fails.

**Solutions:**
```bash
# Check build output
ls -la dist/

# Verify firebase.json configuration
cat firebase.json

# Clear hosting cache
firebase hosting:channel:delete preview
```

### Function Deployment Issues

#### Cold start problems
**Symptoms:** Functions take long to respond initially.

**Solutions:**
```javascript
// Optimize function initialization
const admin = require('firebase-admin');
admin.initializeApp();

// Use connection pooling for database connections
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
```

#### Function timeout errors
**Symptoms:** Functions fail with timeout errors.

**Solutions:**
```javascript
// Increase timeout for long-running functions
exports.longRunningFunction = functions
  .runWith({ timeoutSeconds: 540 }) // 9 minutes
  .https.onCall(async (data, context) => {
    // Function logic
  });
```

### Database Issues

#### Firestore permission errors
**Symptoms:** Read/write operations fail with permission denied.

**Solutions:**
```javascript
// Check security rules
firebase deploy --only firestore:rules

// Verify user authentication
console.log(context.auth.uid);

// Test with Firebase emulator
firebase emulators:start --only firestore
```

#### Query performance issues
**Symptoms:** Database queries are slow.

**Solutions:**
```javascript
// Add proper indexes
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## User-Facing Issues

### Authentication Problems

#### Google sign-in fails
**Symptoms:** OAuth flow fails or redirects incorrectly.

**Solutions:**
```javascript
// Check Firebase Auth configuration
// Firebase Console → Authentication → Sign-in method

// Verify authorized domains
// Firebase Console → Authentication → Settings

// Check browser console for errors
console.error('Auth error:', error);
```

#### Biometric authentication fails
**Symptoms:** Fingerprint/face unlock not working.

**Solutions:**
```javascript
// Check WebAuthn support
if ('credentials' in navigator) {
  console.log('WebAuthn API available');
}

// Verify HTTPS requirement
location.protocol === 'https:'

// Check device biometric settings
// iOS: Settings → Face ID/Touch ID
// Android: Settings → Security → Biometric authentication
```

### Data Synchronization Issues

#### Offline changes not syncing
**Symptoms:** Changes made offline don't appear online.

**Solutions:**
```javascript
// Check service worker status
navigator.serviceWorker.ready.then(registration => {
  console.log('Service worker ready');
});

// Verify background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  console.log('Background sync supported');
}

// Check IndexedDB data
// DevTools → Application → IndexedDB
```

#### Data conflicts
**Symptoms:** Conflicting changes between devices.

**Solutions:**
```javascript
// Implement conflict resolution
const resolveConflict = (localData, remoteData) => {
  // Choose strategy: local wins, remote wins, or merge
  return localData.updatedAt > remoteData.updatedAt ? localData : remoteData;
};
```

## Testing Issues

### Test Failures

#### Component tests failing
**Symptoms:** Unit tests fail unexpectedly.

**Solutions:**
```bash
# Run tests with verbose output
npm test -- --verbose

# Check test coverage
npm run test:coverage

# Debug specific test
npm test -- --testNamePattern="Button component"
```

#### E2E tests failing
**Symptoms:** Playwright tests fail.

**Solutions:**
```bash
# Run tests in headed mode for debugging
npx playwright test --headed

# Check browser console logs
// In test file
await page.on('console', msg => console.log('PAGE LOG:', msg.text()));

# Update test selectors if DOM changed
await page.locator('[data-testid="button"]').click();
```

## Environment-Specific Issues

### Development Environment

#### Hot reload not working
**Symptoms:** Changes not reflecting in browser.

**Solutions:**
```bash
# Restart dev server
npm run dev

# Clear browser cache
// DevTools → Network → Disable cache

# Check for file watching issues
ls -la | grep -E "\.(jsx?|tsx?)$"
```

#### Emulator issues
**Symptoms:** Firebase emulator not starting or behaving incorrectly.

**Solutions:**
```bash
# Kill existing emulators
pkill -f firebase

# Clear emulator data
firebase emulators:clear

# Start with specific options
firebase emulators:start --only functions,firestore
```

### Production Environment

#### CDN caching issues
**Symptoms:** Old version served despite deployment.

**Solutions:**
```bash
# Force cache refresh
// Browser: Hard refresh (Ctrl+F5)

// Firebase: Invalidate CDN cache
firebase hosting:channel:deploy production --force
```

#### Environment variable issues
**Symptoms:** App behaves differently in production.

**Solutions:**
```bash
# Check production environment variables
firebase functions:config:get

# Verify build-time variables
console.log(import.meta.env.VITE_APP_ENV);
```

## Advanced Troubleshooting

### Network Debugging

#### API call failures
```javascript
// Add request/response logging
const response = await fetch('/api/data', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
});

// Log response details
console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers));
const data = await response.json();
console.log('Data:', data);
```

#### WebSocket issues
```javascript
// Debug real-time connections
const socket = new WebSocket('wss://your-app.firebaseio.com');

socket.onopen = () => console.log('WebSocket connected');
socket.onmessage = (event) => console.log('Message:', event.data);
socket.onerror = (error) => console.error('WebSocket error:', error);
socket.onclose = (event) => console.log('WebSocket closed:', event.code);
```

### Performance Profiling

#### Memory leaks
```javascript
// Use Chrome DevTools Memory tab
// Take heap snapshots before and after actions
// Look for growing object counts

// Monitor memory usage
if ('memory' in performance) {
  console.log('Memory usage:', performance.memory);
}
```

#### Bundle analysis
```bash
# Analyze bundle composition
npx vite-bundle-analyzer dist

# Check for large dependencies
npm ls --depth=0 | grep -E "(react|firebase|lodash)"

# Optimize imports
import { useState } from 'react'; // Instead of import React
```

### Security Auditing

#### Dependency vulnerabilities
```bash
# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

#### Content Security Policy violations
```javascript
// Monitor CSP violations
document.addEventListener('securitypolicyviolation', (event) => {
  console.error('CSP violation:', {
    violatedDirective: event.violatedDirective,
    blockedURI: event.blockedURI,
    sourceFile: event.sourceFile
  });
});
```

## Getting Help

### Debug Information
When reporting issues, include:

```javascript
// Browser information
console.log('User Agent:', navigator.userAgent);
console.log('Viewport:', { width: window.innerWidth, height: window.innerHeight });

// App information
console.log('App Version:', import.meta.env.VITE_APP_VERSION);
console.log('Environment:', import.meta.env.VITE_APP_ENV);

// Firebase information
console.log('Firebase Project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

### Support Channels
1. **GitHub Issues**: For bugs and feature requests
2. **GitHub Discussions**: For questions and general help
3. **Stack Overflow**: Tag with `react`, `firebase`, `pwa`
4. **Firebase Community**: For Firebase-specific issues

### Emergency Contacts
- **Security Issues**: Report privately to maintainers
- **Data Loss**: Contact Firebase support immediately
- **Service Outage**: Check Firebase status dashboard

---

This troubleshooting guide covers the most common issues. If you encounter an issue not covered here, please create a detailed GitHub issue with steps to reproduce, environment information, and any relevant logs or screenshots.