# Curiosity PWA

> Your personal AI-powered journal for documenting questions, discoveries, and goals

A modern, secure, and beautiful Progressive Web App for journaling, note-taking, and personal knowledge management. Built with React 19, Firebase, and WebAuthn biometric authentication.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![PWA](https://img.shields.io/badge/PWA-Ready-green) ![React](https://img.shields.io/badge/React-19.1.1-61dafb) ![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌐 Live Preview

Try Curiosity PWA live: **[https://curiosity-pwa.web.app](https://curiosity-pwa.web.app)**

## ✨ Features

### Core Functionality
- **📝 Rich Journaling** - Create entries with markdown support and rich text editing
- **📅 Calendar View** - Visualize your timeline with an interactive calendar
- **🎯 Goals & Tasks** - Track personal goals and daily tasks with progress indicators
- **🔒 Secure Vault** - Store sensitive information with PIN and biometric protection
- **🔔 Smart Reminders** - Never miss important dates and tasks
- **� Data Export** - Export your data to PDF, CSV, JSON, or Excel
- **🎁 On This Day** - Revisit memories from past years
- **🔍 Search & Filter** - Quickly find entries with powerful search

### Beautiful Design
- **🎨 Animated Dashboard** - Vibrant dashboard with Framer Motion animations
- **🌓 Dark Mode** - System-aware theme switching
- **🎨 6 Accent Colors** - Teal, Blue, Purple, Rose, Amber, Emerald
- **📝 4 Font Families** - Inter, Lora, Merriweather, Roboto Mono
- **📱 Mobile-First** - Optimized for mobile with hamburger navigation
- **✨ Live Preview** - See theme changes in real-time during setup

### Security & Privacy
- **🔐 Biometric Auth** - WebAuthn support for fingerprint/face unlock
- **🔑 PIN Lock** - Secure PIN-based app protection with configurable timeout
- **� Local-First** - IndexedDB storage for offline-first architecture
- **☁️ Optional Cloud Sync** - Firebase sync when you need it
- **� Secure Encryption** - Client-side encryption for sensitive data

### Progressive Web App
- **📲 Installable** - Add to home screen on mobile and desktop
- **⚡ Offline Support** - Full functionality without internet
- **🔄 Auto-Updates** - Seamless updates via service worker
- **🚀 Fast Loading** - Optimized with code splitting and caching

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Firebase CLI** (for deployment)
- **Git**

### Local Development

```bash
# Clone the repository
git clone https://github.com/ny-collins/curiosity-pwa.git
cd curiosity-pwa

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Firebase config

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

See the [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions on deploying to Firebase, Vercel, or Netlify.

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

### Getting Started
- [📋 Quick Reference](./docs/QUICK-REFERENCE.md) - Common commands and tasks
- [🛠️ Developer Setup](./docs/setup.md) - Development environment setup
- [� Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment checklist
- [✅ Production Ready](./docs/PRODUCTION-READY.md) - Production readiness status

### Technical Documentation
- [🏗️ Architecture](./docs/architecture.md) - System design and data models
- [🔧 API Reference](./docs/api.md) - Technical API documentation
- [🧪 Testing Guide](./docs/test-guide.md) - Testing strategies

### User & Contributor Guides
- [📱 User Guide](./docs/user-guide.md) - Complete feature walkthrough
- [🤝 Contributing](./docs/contributing.md) - Contribution guidelines
- [🔍 Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions

### Release Information
- [📝 Changelog](./docs/CHANGELOG.md) - Version history and release notes

## 🏗️ Tech Stack

### Frontend
- **React 19.1.1** - Latest React with modern hooks
- **Vite 7.1.7** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Beautiful animations and transitions
- **Lucide React 0.546.0** - Modern icon library
- **Dexie 4.0.8** - IndexedDB wrapper for offline storage
- **React Calendar** - Interactive calendar component
- **React Markdown** - Markdown rendering

### Backend & Infrastructure
- **Firebase 12.4.0** - Backend-as-a-Service platform
  - **Firestore** - NoSQL database with real-time sync
  - **Cloud Functions** - Serverless backend
  - **Firebase Auth** - User authentication (Google OAuth)
  - **Firebase Hosting** - CDN-backed hosting
  - **Cloud Storage** - Secure file storage
- **SimpleWebAuthn** - WebAuthn biometric authentication
- **bcrypt-ts** - Secure password hashing

### PWA & Performance
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Advanced caching strategies
- **Code Splitting** - Optimized bundle sizes
- **Service Worker** - Offline-first architecture

## 🎨 Design Philosophy

Curiosity embraces a **mobile-first, local-first, privacy-focused** approach:

- **Beautiful & Vibrant** - Animated dashboard with delightful interactions
- **Mobile-First** - Optimized for mobile with responsive design
- **Local-First** - Your data stays on your device by default
- **Privacy-Focused** - PIN lock and biometric authentication
- **Customizable** - Multiple themes, fonts, and colors
- **Accessible** - Keyboard navigation and screen reader support
- **Fast** - Optimized for performance and battery life

## 📊 Project Structure

```
curiosity-pwa-vite/
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.jsx   # Animated dashboard with Framer Motion
│   │   ├── Editor.jsx      # Rich text editor
│   │   ├── SettingsPage.jsx # Settings and customization
│   │   ├── CalendarView.jsx # Calendar visualization
│   │   ├── PinLockScreen.jsx # PIN authentication
│   │   └── ...             # Other components
│   ├── contexts/
│   │   ├── AppContext.jsx  # Global app state
│   │   └── StateProvider.jsx # State management
│   ├── constants.js        # App constants and config
│   ├── firebaseConfig.js   # Firebase initialization
│   ├── db.js              # IndexedDB setup (Dexie)
│   └── utils.js           # Utility functions
├── public/
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── custom-sw.js       # Custom service worker
├── functions/             # Firebase Cloud Functions
├── docs/                  # Documentation
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SimpleWebAuthn](https://github.com/MasterKale/SimpleWebAuthn) - WebAuthn implementation
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Framer Motion](https://www.framer.com/motion/) - Amazing animations
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Backend platform
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

- 📧 **Email**: mwangicollins391@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ny-collins/curiosity-pwa/discussions)
- 📚 **Documentation**: [docs/](./docs/)

---

**Made with ❤️ by Collins** • [Version 1.0.0](./docs/CHANGELOG.md) • November 2025