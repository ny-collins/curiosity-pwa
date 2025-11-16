# Curiosity PWA Documentation

**Version**: 1.0.1  
**Last Updated**: November 16, 2025

Welcome to the comprehensive documentation for Curiosity PWA - your personal jotter and productivity companion.

---

## 📚 Documentation Index

### 🚀 Getting Started
- **[Setup Guide](setup.md)** - Complete developer guide: installation, testing, and deployment
- **[User Guide](user-guide.md)** - End-user features and how-tos

### 🛠️ Development
- **[Architecture](architecture.md)** - System design, components, and data flow
- **[API Documentation](api.md)** - Functions, hooks, and component APIs
- **[Contributing Guide](contributing.md)** - How to contribute to the project
- **[Changelog](CHANGELOG.md)** - Version history and release notes

---

## 🚀 Quick Start

### For Users
1. Visit the [User Guide](user-guide.md) to learn how to use Curiosity
2. Check [Common Issues](#-common-issues-quick-fixes) below for quick troubleshooting

### For Developers
1. Follow the [Setup Guide](setup.md) for complete development workflow (setup, testing, deployment)
2. Read the [Architecture](architecture.md) overview to understand the system
3. Check the [API Reference](api.md) for technical details
4. See [Contributing](contributing.md) for contribution guidelines

### Quick Reference
See [Quick Commands](#-quick-commands) below for common tasks
3. Check [Changelog](CHANGELOG.md) for latest updates

---

## 📊 Project Status

**Current Version**: 1.0.1  
**Status**: ✅ Production Ready  
**Deployment**: https://curiosity-pwa.web.app

### Feature Status
- ✅ Core Features: Entries, goals, tasks, reminders, vault
- ✅ Authentication: Google OAuth, WebAuthn biometrics, PIN lock
- ✅ PWA: Offline support, installable, auto-update
- ✅ Mobile: Responsive design, touch-optimized
- ✅ Security: Client-side encryption, secure authentication
- ✅ Customization: 12 color themes, multiple fonts, dark mode

### Browser Support
- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 13+
- ✅ Edge 79+

---

## 🆘 Getting Help

### Support Channels
1. **Documentation**: Check this docs folder first
2. **GitHub Issues**: For bugs and technical issues
3. **Troubleshooting Guide**: [troubleshooting.md](troubleshooting.md)

### Issue Reporting
When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots or console logs

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](contributing.md) for details on:
- Development setup and workflow
- Code standards and conventions
- Testing requirements
- Pull request process

---

## ⚡ Quick Commands

### Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter
```

### Firebase
```bash
firebase login           # Login to Firebase
firebase deploy          # Deploy everything
firebase deploy --only hosting    # Deploy only hosting
firebase deploy --only functions  # Deploy only functions
```

### Git
```bash
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push                 # Push to remote
```

---

## 📜 License

This project is licensed under the MIT License.

---

**Last Update**: November 16, 2025  
**Changes**: 
- Rebranded from "personal journal" to "personal jotter"
- Added quick reference commands
- Updated React version to 19
- Optimized documentation structure

## 🔧 Common Issues (quick fixes)

### Build & Dev
- If `npm run dev` fails with module not found: remove node_modules and reinstall:
	```bash
	rm -rf node_modules package-lock.json
	npm install
	```

### Vite Build Issues
- Clear Vite cache and rebuild:
	```bash
	rm -rf node_modules/.vite
	npm run build
	```

### Firebase & Functions
- If functions deployment fails: check syntax and Node.js version
	```bash
	cd functions && node -c index.js && cd ..
	node --version
	```

### Service Worker Not Updating
- Hard refresh the browser or unregister the service worker in DevTools > Application

### More Help
- **Complex Issues**: Check [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues)
- **Detailed Troubleshooting**: See the Testing & Deployment sections in [Setup Guide](setup.md)

---

**Current Documentation**: 6 focused, consolidated files
