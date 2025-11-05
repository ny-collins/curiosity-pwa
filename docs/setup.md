# Developer Setup Guide

This guide will help you set up the Curiosity PWA development environment on your local machine.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Version 2.25.0 or higher
- **Firebase CLI**: Version 11.0.0 or higher

### Recommended Tools
- **VS Code**: Recommended editor with React and Firebase extensions
- **Chrome DevTools**: For debugging PWA features
- **Postman**: For testing Firebase Functions (optional)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ny-collins/curiosity-pwa.git
cd curiosity-pwa
```

### 2. Install Dependencies

```bash
# Install main app dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup

#### Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Login to Firebase
```bash
firebase login
```

#### Initialize or Use Existing Project
```bash
# Use existing project
firebase use curiosity-pwa

# Or initialize new project
firebase init
```

#### Configure WebAuthn (Required for biometric features)
```bash
# Set relying party ID (use your domain)
firebase functions:config:set webauthn.relying_party_id="curiosity-pwa.web.app"

# Set expected origin (use your HTTPS URL)
firebase functions:config:set webauthn.expected_origin="https://curiosity-pwa.web.app"
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Development
VITE_APP_ENV=development
```

### 5. Firebase Emulator Setup (Optional)

For local development with emulators:

```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

## Development Workflow

### Starting the Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Firebase Functions Development

### Local Functions Development

```bash
# Start functions emulator
cd functions
npm run serve
```

### Deploying Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName
```

### Testing Functions

```bash
# Run function tests
cd functions
npm test
```

## Project Structure

```
curiosity-pwa/
├── public/                 # Static assets (manifest, icons, etc.)
├── src/
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   ├── views/         # Page components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── constants.js       # App constants
│   ├── firebaseConfig.js  # Firebase configuration
│   └── main.jsx           # App entry point
├── functions/             # Firebase Cloud Functions
│   ├── index.js           # Function definitions
│   └── package.json       # Function dependencies
├── docs/                  # Documentation
├── dist/                  # Production build output
├── node_modules/          # Dependencies
├── package.json           # Main package configuration
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # TailwindCSS configuration
├── firebase.json          # Firebase configuration
└── .env                   # Environment variables
```

## Development Guidelines

### Code Style

- **ESLint**: Follows Airbnb JavaScript style guide
- **Prettier**: Automatic code formatting
- **TypeScript**: JSDoc comments for complex functions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow conventional commits:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## Debugging

### Browser DevTools
- Use React DevTools for component debugging
- Network tab for API call monitoring
- Application tab for PWA and storage inspection

### Firebase Debugging
```bash
# View function logs
firebase functions:log

# Debug emulators
firebase emulators:start --debug
```

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Firebase Permission Errors
```bash
# Re-authenticate
firebase logout
firebase login
```

#### Port Conflicts
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## Testing

### Unit Tests
```javascript
// Example test file: src/components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests
```javascript
// Example: Testing authentication flow
test('user can sign in', async () => {
  // Test authentication flow
});
```

### E2E Tests (Playwright)
```javascript
// e2e/example.spec.js
test('user can create a journal entry', async ({ page }) => {
  await page.goto('http://localhost:5173');
  // Test full user journey
});
```

## Deployment

### Staging Deployment
```bash
# Deploy to staging channel
firebase hosting:channel:deploy staging
```

### Production Deployment
```bash
# Full deployment
firebase deploy

# Only hosting
firebase deploy --only hosting

# Only functions
firebase deploy --only functions
```

### Rollback
```bash
# Rollback hosting
firebase hosting:rollback

# Rollback functions (manual process)
```

## Performance Monitoring

### Bundle Analysis
```bash
npm run build:analyze
```

### Lighthouse Testing
```bash
# Run Lighthouse audit
npx lighthouse http://localhost:5173
```

## Security Checklist

- [ ] Environment variables not committed
- [ ] Firebase security rules configured
- [ ] HTTPS enabled in production
- [ ] Content Security Policy headers set
- [ ] Sensitive data encrypted
- [ ] Authentication properly implemented

## Troubleshooting

### Common Development Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

#### Firebase functions not deploying
```bash
# Check function logs
firebase functions:log --only generateRegistrationOptions

# Check function configuration
firebase functions:config:get
```

#### PWA not installing
- Ensure HTTPS in production
- Check web app manifest
- Verify service worker registration

#### Biometric authentication not working
- Ensure HTTPS (required for WebAuthn)
- Check browser compatibility
- Verify Firebase function configuration

### Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ny-collins/curiosity-pwa/discussions)

## Advanced Configuration

### Custom Build Configuration

Edit `vite.config.js` for custom build settings:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth']
        }
      }
    }
  }
});
```

### Environment-Specific Configuration

```javascript
// config.js
const config = {
  development: {
    apiUrl: 'http://localhost:5001',
    debug: true
  },
  production: {
    apiUrl: 'https://your-project.cloudfunctions.net',
    debug: false
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

This setup guide should get you up and running with Curiosity PWA development. Happy coding! 🚀