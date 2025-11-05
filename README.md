# Curiosity PWA

A modern, secure, and beautiful Progressive Web App for journaling, note-taking, and personal knowledge management. Built with React, Firebase, and WebAuthn biometric authentication.

![Curiosity PWA](https://img.shields.io/badge/PWA-Ready-green) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-38B2AC)

## � Live Preview

Try Curiosity PWA live: **[https://curiosity-pwa.web.app](https://curiosity-pwa.web.app)**

## �🌟 Features

### Core Functionality
- **📝 Rich Text Journaling** - Create journal entries, notes, and tasks with Markdown support
- **📅 Calendar View** - Visualize your entries by date with an interactive calendar
- **🎯 Goals Tracking** - Set and track personal goals with progress indicators
- **🔒 Secure Vault** - Store sensitive information with PIN and biometric protection
- **🔔 Smart Reminders** - Set reminders for important dates and tasks
- **📱 Mobile-First Design** - Fully responsive with native mobile navigation

### Security & Privacy
- **🔐 Biometric Authentication** - WebAuthn support for fingerprint/face unlock
- **🔑 PIN Protection** - Secure PIN-based app locking
- **🔒 End-to-End Security** - Client-side encryption for sensitive data
- **👤 User Accounts** - Firebase Authentication with Google sign-in

### PWA Features
- **📲 Installable** - Install on mobile devices and desktops
- **⚡ Offline Support** - Core functionality works offline
- **🔄 Auto-Updates** - Automatic updates via service workers
- **🏠 Home Screen Integration** - Native app-like experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ny-collins/curiosity-pwa.git
   cd curiosity-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Firebase Setup**
   ```bash
   # Login to Firebase
   firebase login

   # Initialize or use existing project
   firebase use curiosity-pwa

   # Set WebAuthn configuration
   firebase functions:config:set webauthn.relying_party_id="your-domain.com"
   firebase functions:config:set webauthn.expected_origin="https://your-domain.com"
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

5. **Development**
   ```bash
   npm run dev
   ```

6. **Build & Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 📖 Documentation

Detailed documentation is available in the [`docs/`](./docs/) folder:

- [🏗️ Architecture Overview](./docs/architecture.md)
- [🛠️ Developer Setup](./docs/setup.md)
- [📱 User Guide](./docs/user-guide.md)
- [🔧 API Reference](./docs/api.md)
- [🚀 Deployment Guide](./docs/deployment.md)
- [🤝 Contributing](./docs/contributing.md)
- [🔍 Troubleshooting](./docs/troubleshooting.md)

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **SimpleMDE** - Markdown editor with live preview
- **React Calendar** - Interactive calendar component

### Backend & Infrastructure
- **Firebase** - Backend-as-a-Service platform
  - Firestore - NoSQL database
  - Cloud Functions - Serverless backend
  - Firebase Auth - User authentication
  - Firebase Hosting - CDN hosting
  - Cloud Storage - File storage
- **WebAuthn** - Modern biometric authentication
- **Dexie** - IndexedDB wrapper for offline storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Firebase Emulator** - Local development

## 🎨 Design Philosophy

Curiosity embraces a **mobile-first, privacy-focused** approach to personal knowledge management:

- **Minimalist UI** - Clean, distraction-free interface
- **Dark/Light Themes** - Automatic theme switching with user preference
- **Accessible** - WCAG compliant with keyboard navigation
- **Performant** - Optimized for speed and battery life
- **Secure** - End-to-end encryption for sensitive data

## 📊 Project Structure

```
curiosity-pwa/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Editor.jsx      # Rich text editor
│   │   ├── SettingsPage.jsx # Settings interface
│   │   └── ...             # Other components
│   ├── contexts/           # React contexts
│   ├── constants.js        # App constants
│   ├── firebaseConfig.js   # Firebase configuration
│   └── utils.js            # Utility functions
├── functions/              # Firebase Cloud Functions
├── docs/                   # Documentation
├── dist/                   # Build output
└── package.json
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

- [SimpleWebAuthn](https://github.com/MasterKale/SimpleWebAuthn) for WebAuthn implementation
- [TailwindCSS](https://tailwindcss.com/) for the amazing utility-first CSS framework
- [Firebase](https://firebase.google.com/) for the robust backend platform
- [React](https://reactjs.org/) for the powerful frontend library

## 📞 Support

- 📧 **Email**: [mwangicollins391@gmail.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ny-collins/curiosity-pwa/discussions)

---

**Made with ❤️ for curious minds everywhere**