# Deployment Guide

This guide covers deploying Curiosity PWA to production, including Firebase hosting, functions, and database setup.

## Prerequisites

### Required Accounts & Tools
- **Firebase Account**: [console.firebase.google.com](https://console.firebase.google.com)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Node.js 18+**: For building and deployment
- **Domain**: Custom domain (optional but recommended)

### System Requirements
- **Build Machine**: 2GB RAM, modern CPU
- **Network**: Stable internet connection
- **Storage**: 500MB free space for build artifacts

## Firebase Project Setup

### 1. Create Firebase Project

```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create curiosity-pwa-prod

# Select the project
firebase use curiosity-pwa-prod
```

### 2. Enable Required APIs

In Firebase Console → Project Settings → General:

**Required APIs:**
- ✅ Cloud Firestore API
- ✅ Cloud Functions API
- ✅ Firebase Hosting API
- ✅ Identity Toolkit API
- ✅ Firebase Storage API

### 3. Configure Authentication

1. Go to Authentication → Sign-in method
2. Enable **Google** provider
3. Configure OAuth consent screen
4. Add authorized domains

### 4. Set Up Firestore Database

1. Go to Firestore Database → Create database
2. Choose **Production mode** (can be changed later)
3. Select a location (choose closest to users)

### 5. Configure Storage (Optional)

1. Go to Storage → Get started
2. Set security rules (see `storage.rules`)

## Application Configuration

### Environment Variables

Create `.env.production` file:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=curiosity-pwa-prod
VITE_FIREBASE_STORAGE_BUCKET=curiosity-pwa-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Production Environment
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Firebase Functions Configuration

```bash
# Set WebAuthn configuration for production
firebase functions:config:set webauthn.relying_party_id="yourdomain.com"
firebase functions:config:set webauthn.expected_origin="https://yourdomain.com"
```

## Build Process

### 1. Install Dependencies

```bash
# Install main dependencies
npm ci

# Install function dependencies
cd functions && npm ci && cd ..
```

### 2. Build Application

```bash
# Production build
npm run build

# Verify build output
ls -la dist/
```

### 3. Test Build Locally

```bash
# Preview production build
npm run preview

# Test PWA functionality
# - Check service worker registration
# - Verify offline functionality
# - Test install prompt
```

## Firebase Deployment

### Option 1: Full Deployment

```bash
# Deploy everything (hosting, functions, firestore)
firebase deploy
```

### Option 2: Staged Deployment

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only firestore rules
firebase deploy --only firestore
```

### Option 3: Preview Deployment

```bash
# Create preview channel
firebase hosting:channel:deploy preview

# Access preview URL
# https://curiosity-pwa-prod--preview.web.app
```

## Custom Domain Setup

### 1. Add Custom Domain

```bash
# Add domain to Firebase Hosting
firebase hosting:sites:create curiosity-pwa-prod

# Or through Firebase Console:
# Hosting → Add custom domain
```

### 2. DNS Configuration

Add these records to your DNS provider:

```dns
# A Records
yourdomain.com. 300 IN A 199.36.158.100

# AAAA Records (IPv6)
yourdomain.com. 300 IN AAAA 2620:0:890::100

# CNAME for www
www.yourdomain.com. 300 IN CNAME curiosity-pwa-prod.web.app.
```

### 3. SSL Certificate

Firebase automatically provisions SSL certificates. Wait 24-48 hours for propagation.

## Database Setup

### Firestore Security Rules

Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

### Initial Data Seeding (Optional)

```javascript
// scripts/seed.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Seed initial data
async function seedData() {
  // Add sample goals, entries, etc.
}

seedData();
```

## Monitoring & Analytics

### Firebase Analytics Setup

1. Enable Analytics in Firebase Console
2. Add measurement ID to environment variables
3. Configure custom events:

```javascript
// Track custom events
firebase.analytics().logEvent('entry_created', {
  entry_type: 'journal',
  word_count: 250
});
```

### Performance Monitoring

```javascript
// Enable Performance Monitoring
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);
```

### Error Reporting

```javascript
// Enable Crashlytics
import { getCrashlytics } from 'firebase/crashlytics';

const crashlytics = getCrashlytics(app);
```

## CDN & Performance Optimization

### Firebase Hosting Configuration

Update `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.png",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## Backup & Recovery

### Automated Backups

```bash
# Schedule daily backups (using cron)
0 2 * * * firebase firestore:export gs://curiosity-pwa-backups/$(date +%Y%m%d)
```

### Manual Backup

```bash
# Export all data
firebase firestore:export gs://your-backup-bucket/$(date +%Y%m%d_%H%M%S)

# Export specific collections
firebase firestore:export --collection-ids=users,entries gs://your-backup-bucket
```

### Recovery

```bash
# Import from backup
firebase firestore:import gs://your-backup-bucket/20240101_020000
```

## Security Hardening

### Environment Variables

Never commit secrets to version control:

```bash
# Check for exposed secrets
npm run audit-secrets
```

### CORS Configuration

Update `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}
```

### Content Security Policy

```javascript
// Add to index.html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com;
">
```

## Scaling & Performance

### Function Scaling

```javascript
// Configure function memory and timeout
exports.myFunction = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 540,
  })
  .https.onCall(async (data, context) => {
    // Function logic
  });
```

### Database Indexing

Create composite indexes for complex queries:

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "type",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Firebase CLI
      run: npm install -g firebase-tools

    - name: Build
      run: npm run build

    - name: Deploy to Firebase
      run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check function status
firebase functions:list

# Check hosting status
firebase hosting:sites:list

# Monitor function logs
firebase functions:log --only generateRegistrationOptions
```

### Performance Monitoring

```bash
# View function metrics
firebase functions:log --only generateRegistrationOptions --limit 100

# Check hosting analytics
# Firebase Console → Hosting → Analytics
```

### Regular Maintenance

```bash
# Update dependencies monthly
npm audit fix
npm update

# Clean up old function versions
firebase functions:list --limit 10

# Monitor storage usage
firebase storage:list
```

## Troubleshooting Deployment

### Common Issues

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Functions Not Deploying
```bash
# Check function logs
firebase functions:log

# Verify configuration
firebase functions:config:get

# Check function code for syntax errors
cd functions && node -c index.js
```

#### Hosting Not Updating
```bash
# Clear hosting cache
firebase hosting:channel:delete preview

# Force redeploy
firebase deploy --only hosting --force
```

#### SSL Certificate Issues
```bash
# Check domain verification
firebase hosting:sites:list

# Re-verify domain
firebase hosting:sites:delete curiosity-pwa-prod
firebase hosting:sites:create curiosity-pwa-prod
```

### Rollback Procedures

```bash
# Rollback hosting
firebase hosting:rollback

# Rollback functions (manual)
# Deploy previous version from git
git checkout v1.0.0
firebase deploy --only functions
```

## Cost Optimization

### Firebase Pricing Considerations

- **Spark Plan** (Free): Up to 1GB storage, 125k function invocations
- **Blaze Plan** (Pay-as-you-go): Scales with usage

### Cost Monitoring

```bash
# Check current usage
# Firebase Console → Usage and billing

# Set up billing alerts
# Firebase Console → Usage and billing → Budget alerts
```

### Optimization Strategies

1. **Function Cold Starts**: Use keep-alive strategies
2. **Storage Optimization**: Compress files, set lifecycle policies
3. **Database Queries**: Use efficient queries with proper indexing
4. **Caching**: Implement CDN caching for static assets

## Post-Deployment Checklist

- [ ] ✅ Application loads correctly
- [ ] ✅ Authentication works (Google sign-in)
- [ ] ✅ PWA installs on mobile devices
- [ ] ✅ Offline functionality works
- [ ] ✅ Biometric authentication functions properly
- [ ] ✅ Database operations work (CRUD)
- [ ] ✅ Custom domain configured and SSL active
- [ ] ✅ Analytics and monitoring enabled
- [ ] ✅ Backup procedures tested
- [ ] ✅ Security rules deployed
- [ ] ✅ Performance optimized

## Support & Maintenance

### Monitoring Tools
- **Firebase Console**: Real-time monitoring
- **Google Analytics**: User behavior insights
- **Sentry**: Error tracking and alerting
- **UptimeRobot**: External monitoring

### Regular Tasks
- **Weekly**: Check error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review analytics and plan improvements
- **Annually**: Security audit and compliance review

This deployment guide ensures a robust, scalable production environment for Curiosity PWA. For additional support, check the troubleshooting guide or create an issue on GitHub.