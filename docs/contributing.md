# Contributing Guide

Thank you for your interest in contributing to Curiosity PWA! This guide will help you get started with development, understand our processes, and make meaningful contributions to the project.

## Code of Conduct

### Our Standards
We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Inclusive**: Welcome contributors from all backgrounds and skill levels
- **Be Collaborative**: Work together to solve problems and improve the codebase
- **Be Patient**: Understand that not everyone has the same context or experience

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or off-topic content
- Sharing private information without consent

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Firebase CLI
- A code editor (VS Code recommended)
- Basic knowledge of React, Firebase, and modern web development

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see [Setup Guide](./setup.md))
4. **Create a feature branch** for your changes

```bash
git clone https://github.com/your-username/curiosity-pwa.git
cd curiosity-pwa
npm install
cd functions && npm install && cd ..
npm run dev
```

## Development Workflow

### 1. Choose an Issue
- Check [GitHub Issues](https://github.com/ny-collins/curiosity-pwa/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
# Create and switch to a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes
- Write clear, concise commit messages
- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes
```bash
# Run the test suite
npm test

# Run linting
npm run lint

# Build the project
npm run build

# Test with Firebase emulator
firebase emulators:start
```

### 5. Submit a Pull Request
- Push your branch to your fork
- Create a Pull Request with a clear description
- Reference any related issues
- Wait for review and address feedback

## Code Style & Standards

### JavaScript/React
- Use modern ES6+ syntax
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components and hooks
- Prefer TypeScript for new components (optional but encouraged)

### CSS/Tailwind
- Use Tailwind utility classes
- Follow component-based CSS architecture
- Use CSS custom properties for theming
- Maintain responsive design principles

### Git Commit Messages
Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add biometric authentication support
fix(editor): resolve cursor jumping issue
docs(readme): update installation instructions
```

### Branch Naming
```
feature/feature-name
fix/issue-number-description
docs/update-documentation
refactor/component-name
```

## Project Structure

### Component Organization
```
src/components/
├── common/          # Shared, reusable components
├── views/           # Page-level components
├── forms/           # Form components
├── layout/          # Layout and navigation
└── ui/             # Basic UI components
```

### File Naming
- Components: `PascalCase` (e.g., `UserProfile.jsx`)
- Utilities: `camelCase` (e.g., `formatDate.js`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `API_ENDPOINTS.js`)

## Testing

### Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows

### Writing Tests
```javascript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.jsx
```

## Documentation

### Documentation Standards
- Keep README.md up to date
- Document new features in relevant docs
- Add JSDoc comments for complex functions
- Update API documentation for backend changes

### Documentation Structure
```
docs/
├── architecture.md     # System architecture
├── setup.md           # Development setup
├── user-guide.md      # User documentation
├── api.md             # API reference
├── deployment.md      # Deployment guide
├── contributing.md    # This file
└── troubleshooting.md # Common issues
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] Commit messages are clear and conventional
- [ ] Branch is up to date with main

### PR Template
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### Review Process
1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review code quality and architecture
3. **Testing**: Changes tested in staging environment
4. **Approval**: PR approved and merged by maintainers

## Issue Reporting

### Bug Reports
When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (browser, OS, device)
- **Screenshots or videos** if applicable
- **Console errors** or logs

### Feature Requests
For new features, please provide:

- **Clear description** of the proposed feature
- **Use case** and problem it solves
- **Mockups or examples** if possible
- **Implementation ideas** if you have them

## Community Guidelines

### Communication
- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions and general discussion
- Be patient and respectful in all interactions
- Help other contributors when possible

### Recognition
Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Special contributor badges
- Invitation to become maintainers

## Advanced Contributions

### Architecture Decisions
For significant changes to architecture:

1. **Create an ADR** (Architecture Decision Record)
2. **Discuss in GitHub Discussions**
3. **Get consensus** from maintainers
4. **Document the decision** in relevant docs

### Performance Optimizations
When contributing performance improvements:

- **Benchmark before and after** changes
- **Include performance metrics** in PR description
- **Consider impact on bundle size** and runtime performance
- **Test on various devices** and network conditions

### Security Contributions
For security-related changes:

- **Report security issues privately** first
- **Follow responsible disclosure** practices
- **Include security implications** in PR description
- **Update security documentation** as needed

## Getting Help

### Resources
- **Documentation**: Check the `docs/` folder
- **GitHub Issues**: Search for similar issues
- **GitHub Discussions**: Ask questions in community
- **Stack Overflow**: Tag with `react`, `firebase`, `pwa`

### Contact Maintainers
- **Issues**: Create GitHub issue with detailed information
- **Security**: Email maintainers privately for security issues
- **General**: Use GitHub Discussions for questions

## Recognition & Rewards

### Contributor Recognition
- **First-time contributors** get special mention
- **Regular contributors** may be invited to become maintainers
- **Significant contributions** highlighted in release notes
- **Community recognition** through contributor badges

### Becoming a Maintainer
Maintainers are selected based on:
- **Code quality** and contribution consistency
- **Community involvement** and helpfulness
- **Understanding of project architecture**
- **Commitment to project goals**

## License

By contributing to Curiosity PWA, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Curiosity PWA! Your efforts help make personal knowledge management better for everyone. 🚀</parameter>