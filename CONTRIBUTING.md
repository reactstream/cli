# Contributing to ReactStream

## 👋 Welcome!

Thank you for considering contributing to ReactStream! This document provides guidelines and instructions for contributing to the project.

## 🗺 Getting Started

1. **Fork the Repository**
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/reactstream.git

# Add upstream remote
git remote add upstream https://github.com/original/reactstream.git
```

2. **Set Up Development Environment**
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

## 🏗 Project Structure

```
reactstream/
├── src/
│   ├── core/           # Core functionality
│   ├── analyzer/       # Code analysis tools
│   ├── components/     # UI components
│   └── utils/          # Helper functions
├── bin/               # CLI tools
├── tests/            # Test files
└── docs/             # Documentation
```

## 🔍 Development Guidelines

### Code Style

- Follow the existing code style
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Include JSDoc comments for functions

### Commits

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Example:
```
feat(analyzer): add performance metrics tracking
```

### Testing

- Write tests for new features
- Update existing tests when modifying code
- Ensure all tests pass before submitting PR
- Maintain test coverage above 80%

### Documentation

- Update README.md if needed
- Document new features
- Update API documentation
- Include JSDoc comments

## 🚀 Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Write code
- Add tests
- Update documentation

3. **Commit Changes**
```bash
git add .
git commit -m "feat(scope): description"
```

4. **Update from Upstream**
```bash
git fetch upstream
git rebase upstream/main
```

5. **Push and Create PR**
```bash
git push origin feature/your-feature-name
```

Then create PR through GitHub interface.

## 🐛 Bug Reports

Please include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 🎯 Feature Requests

Include:
- Clear description of feature
- Use cases
- Expected behavior
- Mockups/examples if applicable

## 📋 Code Review Process

1. **Initial Review**
    - Code style
    - Test coverage
    - Documentation
    - Performance impact

2. **Technical Review**
    - Architecture
    - Security
    - Performance
    - Edge cases

3. **Final Review**
    - Integration testing
    - Documentation completeness
    - Breaking changes

## 🏷 Release Process

1. **Version Bump**
```bash
npm version [patch|minor|major]
```

2. **Generate Changelog**
```bash
npm run changelog
```

3. **Create Release**
```bash
git tag -a v1.x.x -m "Version 1.x.x"
git push origin v1.x.x
```

## 📘 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

- Use welcoming language
- Be respectful of differing viewpoints
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

- First violation: Warning
- Second violation: Temporary ban
- Third violation: Permanent ban

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
