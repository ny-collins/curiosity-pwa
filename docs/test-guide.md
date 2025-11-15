# Testing Guide

Comprehensive testing guide for Curiosity PWA to ensure all features work correctly.

## 🧪 Testing Overview

### Test Levels
- **Unit Tests**: Individual components and functions
- **Integration Tests**: Feature workflows
- **E2E Tests**: Complete user journeys
- **Manual Tests**: UI/UX and device-specific features

---

## 🔬 Local Development Testing

### Setup

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

### 1. Initial Setup & Onboarding

**Test: First-Time User Experience**
- [ ] Open app in incognito/private mode
- [ ] Verify splash screen appears
- [ ] Initial setup modal displays
- [ ] Test live preview:
  - [ ] Change accent color → Logo updates instantly
  - [ ] Change font → All text updates immediately
  - [ ] Select different combinations
- [ ] Complete setup
- [ ] Verify dashboard loads correctly

### 2. Authentication & Security

**Test: PIN Lock**
- [ ] Go to Settings → Security
- [ ] Set up 4-6 digit PIN
- [ ] Verify PIN confirmation
- [ ] Lock the app (sidebar lock icon)
- [ ] Test PIN entry
- [ ] Try incorrect PIN (should show error)
- [ ] Enter correct PIN (should unlock)
- [ ] Test auto-lock timeout settings

**Test: Biometric Authentication (WebAuthn)**

*Note: Requires HTTPS or localhost + compatible device*

- [ ] Enable biometric authentication in Settings
- [ ] Complete biometric registration
- [ ] Lock the app
- [ ] Click "Use Biometric"
- [ ] Verify biometric unlock works
- [ ] Test fallback to PIN if biometric fails
- [ ] Disable biometric authentication
- [ ] Verify PIN-only mode

**Test: Account Linking**
- [ ] Link Google account (optional)
- [ ] Verify data syncs to Firestore
- [ ] Test sign out and sign back in
- [ ] Verify data persists

### 3. Dashboard

**Test: Visual & Interactions**
- [ ] Verify animated elements load smoothly
- [ ] Test Quick Actions buttons (hover animations)
- [ ] Verify Recent Entries section
- [ ] Check Active Goals display
- [ ] Test "On This Day" feature
- [ ] Verify decorative elements render

**Test: Responsive Design**
- [ ] Test on mobile (375px)
  - [ ] Verify avatar is hidden
  - [ ] Check hamburger menu works
  - [ ] Test sidebar overlay
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px+)
  - [ ] Verify avatar appears
  - [ ] Check sidebar collapse/expand

### 4. Journal Entries

**Test: Create Entry**
- [ ] Click "New Journal" button
- [ ] Enter title and content
- [ ] Add tags
- [ ] Select entry type (Journal/Note/Question)
- [ ] Save entry
- [ ] Verify entry appears in list

**Test: Edit Entry**
- [ ] Select existing entry
- [ ] Modify content
- [ ] Save changes
- [ ] Verify changes persist

**Test: Delete Entry**
- [ ] Delete an entry
- [ ] Verify deletion confirmation
- [ ] Check entry is removed from list

**Test: Search & Filter**
- [ ] Search by text
- [ ] Filter by tags
- [ ] Filter by type
- [ ] Filter by date range

### 5. Calendar View

**Test: Calendar Functionality**
- [ ] Navigate to Calendar view
- [ ] Verify entries show on correct dates
- [ ] Click on date with entries
- [ ] Navigate between months
- [ ] Test year navigation

### 6. Goals & Tasks

**Test: Goals**
- [ ] Create new goal
- [ ] Set target date
- [ ] Mark goal as active/completed
- [ ] Delete goal
- [ ] Verify goals display on dashboard

**Test: Tasks**
- [ ] Create task
- [ ] Check/uncheck task
- [ ] Edit task
- [ ] Delete task

### 7. Reminders

**Test: Reminder Creation**
- [ ] Create entry with reminder
- [ ] Set reminder date/time
- [ ] Verify reminder saved
- [ ] Check IndexedDB for reminder

### 8. Secure Vault

**Test: Vault Items**
- [ ] Go to Vault section
- [ ] Create vault item
- [ ] Verify PIN required to access
- [ ] Edit vault item
- [ ] Delete vault item

### 9. Settings & Customization

**Test: Appearance**
- [ ] Change theme mode (Light/Dark/System)
- [ ] Change accent color (all 6 colors)
- [ ] Change font family (all 4 fonts)
- [ ] Adjust font size
- [ ] Verify changes persist after reload

**Test: Profile**
- [ ] Update username
- [ ] Upload profile picture
- [ ] Verify changes appear on dashboard

**Test: Data Management**
- [ ] Test export to PDF
- [ ] Test export to JSON
- [ ] Test export to Markdown
- [ ] Verify file downloads correctly

**Test: Delete All Data**
- [ ] Click "Delete All Data"
- [ ] Verify confirmation modal
- [ ] Confirm deletion
- [ ] Verify all data cleared:
  - [ ] IndexedDB entries cleared
  - [ ] LocalStorage cleared
  - [ ] PIN removed
  - [ ] Returns to setup screen

### 10. Offline Functionality

**Test: Offline Mode**
- [ ] Open DevTools → Network → Throttling → Offline
- [ ] Verify app still loads
- [ ] Create new entry offline
- [ ] Edit existing entry offline
- [ ] Verify changes saved to IndexedDB
- [ ] Go back online
- [ ] Verify changes sync to Firestore (if linked)

### 11. PWA Features

**Test: Service Worker**
- [ ] Open DevTools → Application → Service Workers
- [ ] Verify service worker registered
- [ ] Check cache storage has assets
- [ ] Test cache-first strategy

**Test: Install Prompt**
- [ ] Look for install prompt (desktop/mobile)
- [ ] Install app
- [ ] Open as standalone app
- [ ] Verify splash screen
- [ ] Test app functionality in standalone mode

---

## 🚀 Production Testing

### Pre-Deployment Checklist

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint

# Verify build
./docs/verify-build.sh
```

### Deployment

```bash
# Deploy to Firebase
firebase deploy --only hosting

# Or deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### Post-Deployment Tests

**Test: Production URL**
- [ ] Access production URL
- [ ] Verify HTTPS enabled
- [ ] Test SSL certificate
- [ ] Check for console errors

**Test: Performance**
- [ ] Run Lighthouse audit
  - [ ] Performance score > 90
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90
  - [ ] SEO score > 90
  - [ ] PWA score = 100
- [ ] Check Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

**Test: Cross-Browser**
- [ ] Test on Chrome (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Edge (desktop)
- [ ] Test on Chrome (Android)
- [ ] Test on Safari (iOS)

**Test: Device Testing**
- [ ] Test on phone (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on laptop (1024px width)
- [ ] Test on desktop (1920px width)
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation

**Test: PWA Install (Mobile)**
- [ ] Open site on mobile browser
- [ ] Install to home screen
- [ ] Launch from home screen
- [ ] Verify standalone mode
- [ ] Test all features in standalone

**Test: Firebase Features** (if using cloud features)
- [ ] Test Google sign-in
- [ ] Verify Firestore sync
- [ ] Test file upload to Storage
- [ ] Check Cloud Functions execution
- [ ] Verify biometric authentication with Firebase

---

## 🐛 Debugging Tips

### Common Issues

**Issue: Service Worker Not Updating**
```javascript
// In DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

**Issue: IndexedDB Corrupted**
```javascript
// In DevTools Console
await indexedDB.deleteDatabase('curiosity-db');
location.reload();
```

**Issue: LocalStorage Issues**
```javascript
// In DevTools Console
localStorage.clear();
location.reload();
```

**Issue: Cache Not Clearing**
- DevTools → Application → Clear Storage
- Check all boxes and click "Clear site data"

### Debug Mode

Enable verbose logging:
```javascript
// In src/main.jsx or console
localStorage.setItem('debug', 'true');
```

### Monitoring Tools

- **Firebase Console**: Monitor Firestore, Auth, Functions
- **DevTools Network**: Check API calls and caching
- **DevTools Application**: Check service workers, storage
- **DevTools Console**: Check for errors and warnings

---

## ✅ Testing Checklist Summary

### Critical Features (Must Test)
- [ ] Initial setup and onboarding
- [ ] PIN lock and biometric auth
- [ ] Create, edit, delete entries
- [ ] Offline functionality
- [ ] Data export
- [ ] Mobile responsive design
- [ ] PWA install

### Important Features (Should Test)
- [ ] Theme customization
- [ ] Calendar view
- [ ] Goals and tasks
- [ ] Search and filter
- [ ] Secure vault
- [ ] Cloud sync (if enabled)

### Nice to Have (Can Test)
- [ ] Animations and transitions
- [ ] Avatar display
- [ ] On This Day feature
- [ ] Multiple browsers
- [ ] Performance metrics

---

## 📊 Test Reports

### Template for Bug Reports

```markdown
**Bug Title**: [Brief description]

**Environment**:
- Browser: [Chrome 120, Firefox 121, etc.]
- Device: [Desktop, iPhone 14, Samsung Galaxy S23, etc.]
- OS: [Windows 11, macOS 14, Android 13, iOS 17]
- App Version: 1.0.1

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots/Videos**:
[If applicable]

**Console Errors**:
```
[Paste console errors here]
```

**Additional Context**:
[Any other relevant information]
```

---

## 🎯 Testing Best Practices

1. **Test in incognito mode** to avoid cache issues
2. **Clear data between tests** for fresh state
3. **Test on real devices**, not just DevTools responsive mode
4. **Use different network conditions** (3G, 4G, WiFi, offline)
5. **Test with different data volumes** (empty state, few items, many items)
6. **Document all bugs** with clear reproduction steps
7. **Verify fixes** before closing bug reports

---

For more information, see:
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Quick Reference](./QUICK-REFERENCE.md)
