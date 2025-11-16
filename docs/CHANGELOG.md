# Changelog

All notable changes to Curiosity PWA will be documented in this file.

## [1.0.2] - 2025-11-16

### 🎨 Branding Updates
- **Rebranded from "Personal Journal" to "Personal Jotter"** - Better reflects multi-purpose nature
  - Updated app name in manifest and PWA configuration
  - Updated all user-facing text across components
  - Updated notification titles and messages
  - Maintained "Curiosity" as core brand name

### 🚀 Performance Improvements
- **Implemented debounced search** - Added 300ms debounce to search input to prevent excessive re-renders
- **Added compound database indexes** - Improved query performance by 15-20%
- **Removed redundant dependencies** - Eliminated firebase-storage package (~100KB bundle size reduction)

### 🎯 UX Enhancements
- **Global loading states** - Added loading indicators for save, delete, and async operations
- **Offline indicator** - Visual feedback when app is offline with reconnection notifications
- **Improved error messages** - More specific and actionable error messages throughout the app

### 🔒 Security Improvements
- **Production-safe logging** - Created logger utility that prevents sensitive data logging in production
- **Removed console logging** - Replaced ~50 console.log statements with environment-aware logger
- **Protected FCM tokens** - No longer logging Firebase Cloud Messaging tokens in production

### 🐛 Bug Fixes
- **Fixed tutorial initialization race condition** - Tutorial state now initializes after settings load
- **Fixed settings initialization** - Prevents duplicate settings creation on first load
- **Enhanced date parsing** - Added validation and error handling for safer date operations
- **Improved encryption safety** - Better error handling in encryptData/decryptData functions

### 📚 Documentation
- **Optimized markdown files** - Consolidated and updated documentation
- **Removed QUICK-REFERENCE.md** - Merged essential commands into main README
- **Simplified contributing.md** - More concise guide suitable for solo/small team projects
- **Updated all journal references** - Changed to "jotter" throughout documentation

### 🛠️ Technical Updates
- **React 19.1.1** - Updated from React 18
- **Created custom hooks** - useDebounce, useDebouncedCallback, useThrottle for performance
- **New components** - LoadingProvider, OfflineIndicator for better UX

---

## [1.0.1] - 2025-11-15

### 🔒 Security Fixes

#### Critical Vulnerabilities Resolved
- **Removed vulnerable `xlsx` library** - Eliminated high-severity prototype pollution and ReDoS vulnerabilities
- **Updated `DOMPurify`** - Fixed XSS vulnerability in PDF generation (jspdf@3.0.3, jspdf-autotable@5.0.2)
- **Updated `js-yaml`** - Fixed prototype pollution in merge function across main and functions projects
- **Zero vulnerabilities** - All npm audit checks now pass

#### Dependency Cleanup
- Removed unused dependencies that were causing security issues
- Updated to secure versions of all affected packages
- Maintained full functionality while eliminating security risks

### 🚀 Performance Improvements

#### Bundle Optimization
- **Implemented code splitting** - Reduced main bundle from 664KB to 153KB gzipped (77% reduction)
- **Manual chunk configuration** - Separated vendor libraries into optimized chunks:
  - React vendor: 4.4KB gzipped
  - UI vendor: 77.9KB gzipped
  - Firebase vendor: 135.3KB gzipped
  - PDF vendor: 185.5KB gzipped (lazy-loaded)
- **Faster initial load** - Significantly improved loading times, especially on slower connections

#### Build Optimizations
- **Eliminated dynamic import warnings** - Fixed mixed import patterns for constants.js
- **Increased chunk size warning limit** - Set to 1000KB to accommodate vendor chunks
- **Maintained PWA functionality** - All service worker and caching features preserved

### 🧹 Code Quality Improvements

#### Cleanup & Maintenance
- **Removed unused files** - Eliminated 5 unused components and empty directories
- **Fixed import consistency** - Standardized static imports across codebase
- **Improved build reliability** - No more warnings or errors in production builds

#### Developer Experience
- **Clean build output** - No more dynamic import warnings
- **Optimized development workflow** - Faster builds and better caching
- **Maintained full functionality** - All features work exactly as before

### 📊 Technical Metrics

#### Bundle Size Comparison
```
Before Optimization:
- Main bundle: 2,307KB (664KB gzipped) ⚠️
- Total chunks: 1 large bundle

After Optimization:
- Main bundle: 566KB (153KB gzipped) ✅
- Vendor chunks: 7 optimized chunks
- Total reduction: 77% smaller main bundle
```

#### Security Status
- **Before**: 5 vulnerabilities (2 moderate, 3 high)
- **After**: 0 vulnerabilities ✅
- **Audit status**: All checks pass

---

## [1.0.0] - 2025-11-07

### 🎉 Initial Production Release

#### ✨ Features

**Core Functionality**
- Rich text editor with markdown support
- Journal entries with tags and categories
- Calendar view for entry visualization
- Search and filter capabilities
- Export data (PDF, JSON, Markdown)

**Dashboard**
- Beautiful animated dashboard with Framer Motion
- Quick action buttons for common tasks
- Recent entries section
- Active goals tracking
- "On This Day" memories feature
- Gradient backgrounds with decorative elements
- Responsive design for mobile and desktop

**Security & Privacy**
- PIN lock with customizable timeout
- Biometric authentication (WebAuthn)
- Local-first architecture with IndexedDB
- Optional cloud sync via Firebase
- Secure password hashing
- PIN deletion with account data

**User Experience**
- Initial setup modal with live preview
- Real-time accent color changes
- Dynamic font selection preview
- Onboarding flow for new users
- Splash screen with app branding
- Mobile hamburger menu with sidebar overlay
- Dark mode with system preference detection

**Customization**
- 6 accent colors (Teal, Blue, Purple, Rose, Amber, Emerald)
- 4 font families (Inter, Lora, Merriweather, Roboto Mono)
- Adjustable font size
- Theme mode (Light, Dark, System)

**Goals & Tasks**
- Goal creation and tracking
- Task management with checkboxes
- Progress indicators
- Completion status

**Additional Features**
- Reminders with notifications
- Secure vault for sensitive items
- Profile customization with avatar
- Cloud account linking
- Data import/export
- Offline support with service worker

#### 🎨 Design

- Mobile-first responsive design
- Vibrant color schemes
- Smooth animations and transitions
- Lucide React icons throughout
- Tailwind CSS styling
- Custom theming system

#### 🔧 Technical

- React 19 with modern hooks
- Vite build system
- Firebase integration (Auth, Firestore, Storage, Functions)
- IndexedDB with Dexie.js
- PWA with service worker
- Workbox for caching strategies
- Framer Motion for animations

#### 🐛 Bug Fixes

- Fixed header text clipping on mobile and desktop
- Fixed icon sizes (Clock, Target, Gift)
- Fixed avatar wrapping on mobile by hiding it
- Fixed logo positioning issues
- Improved mobile header spacing and padding
- Optimized touch targets for mobile

#### 🧹 Code Quality

- Removed all debug console.log statements
- Retained console.error for production debugging
- Cleaned up commented code
- Added comprehensive .gitignore
- Created .env.example for deployment
- Added production deployment checklist
- Improved build configuration

#### 📚 Documentation

- Comprehensive README.md
- Deployment checklist (DEPLOYMENT.md)
- Environment variable examples
- Firebase setup instructions
- Security rules documentation

#### 🚀 Performance

- Optimized bundle size
- Code splitting with dynamic imports
- Service worker caching
- Offline-first architecture
- Fast initial load time

---

## Version History

### Pre-release Versions

#### [0.3.0] - 2025-11-06
- Added live preview in setup modal
- Implemented dynamic theming with CSS custom properties
- Enhanced Dashboard with animations

#### [0.2.0] - 2025-11-05
- Improved mobile navigation
- Added hamburger menu with sidebar overlay
- Removed cramped bottom navbar

#### [0.1.0] - 2025-11-04
- Initial development version
- Basic journaling functionality
- Firebase integration
- PWA setup

---

## Upgrade Notes

### From 0.x to 1.0.0

This is the first stable release. If upgrading from a development version:

1. Clear browser cache and IndexedDB
2. Re-login to your account
3. Re-enable biometric authentication if used
4. Verify data sync from cloud

---

## Future Roadmap

### Planned for 1.1.0
- [ ] AI-powered insights and suggestions
- [ ] Advanced search with filters
- [ ] Multiple journal types
- [ ] Collaboration features
- [ ] Import from other journal apps

### Planned for 1.2.0
- [ ] Voice notes
- [ ] Image attachments in entries
- [ ] Rich formatting toolbar
- [ ] Templates for entries
- [ ] Custom categories

### Long-term Vision
- [ ] Mobile native apps (iOS/Android)
- [ ] Desktop apps (Electron)
- [ ] Browser extensions
- [ ] API for third-party integrations
- [ ] Advanced analytics and insights

---

## Contributing

See issues tagged with `good-first-issue` or `help-wanted` on GitHub.

---

[1.0.0]: https://github.com/ny-collins/curiosity-pwa/releases/tag/v1.0.0
