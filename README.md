![logo-reactstream2.svg](img/logo-reactstream2.svg)

# ReactStream

ReactStream is a comprehensive CLI toolkit designed to streamline React component development and debugging. It provides two main features:

1. **Component Analysis**: Analyze React components for common issues, best practices, and optimization opportunities.
2. **Development Server**: Quickly test and debug React components in isolation without needing to set up a full project.

# ReactStream Installation Guide

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn

## Option 1: Install from npm

The easiest way to install ReactStream is via npm:

```bash
# Install globally
npm install -g @reactstream/cli

# Or install in your project
npm install --save-dev @reactstream/cli
```

## Option 2: Install from Source

If you want to install from source code:

1. Clone the repository:
   ```bash
   git clone https://github.com/reactstream/cli.git
   cd cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Link the package to make the commands available globally:
   ```bash
   npm link
   ```

## Verifying Installation

To verify that ReactStream was installed correctly:

```bash
# Check the version
reactstream --version

# View help information
reactstream help
```

## Setting Up File Permissions

If you're installing from source, you might need to make the scripts executable:

```bash
chmod +x bin/reactstream.js
chmod +x bin/reactstream-analyze.js
```

## Troubleshooting

### Common Issues

1. **Command not found**

   If you get a "command not found" error, make sure the npm bin directory is in your PATH:
   ```bash
   export PATH="$PATH:$(npm bin -g)"
   ```

2. **Permission issues**

   If you encounter permission issues when installing globally, you can:
   ```bash
   # Option 1: Use sudo (not recommended)
   sudo npm install -g @reactstream/cli
   
   # Option 2: Fix npm permissions (recommended)
   # See: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
   ```

3. **ESLint errors**

   If you see ESLint errors, make sure you have a valid `.eslintrc.js` file in your project root.

## Commands

ReactStream now provides a unified command interface with subcommands:

```bash
reactstream <command> [options] [arguments]
```


### analyze

Analyze React components for issues and best practices.

```bash
reactstream analyze <component1.js> [component2.js...] [options]
```

**Options:**
- `--fix`: Attempt to automatically fix issues
- `--debug`: Show debug information
- `--verbose`: Show more detailed output

**Examples:**
```bash
reactstream analyze MyComponent.js
reactstream analyze src/components/*.js --fix
```

### serve

Start a development server for testing React components.

```bash
reactstream serve <component1.js> [component2.js...] [options]
```

**Options:**
- `--port=<port>`: Specify the port to run the server on (default: 3000)

**Examples:**


![img_2.png](img/img_2.png)

```bash
reactstream serve MyComponent.js
```

```bash
npm run serve MyComponent.js
```

```bash
node src/reactstream.js serve MyComponent.js
```

![img_1.png](img/img_1.png)


```bash
reactstream serve src/components/Button.js src/components/Card.js --port=8080
```

## Features

### Analysis Features
- Syntax validation for React components
- ESLint integration for code quality
- Import analysis to detect unused imports
- Hook usage analysis to ensure proper usage of React hooks
- Performance analysis to detect potential bottlenecks
- Accessibility checks for common issues
- Automatic fixing of certain issues

### Development Server Features
- Hot module replacement for instant feedback
- Isolation testing environment for components
- Built-in UI component library for testing
- Support for multiple components at once
- Custom port configuration

## Detailed Features

### 1. Syntax and Structure Analysis
- Checking JSX syntax validity
- Analyzing imports and exports
- Detecting unused imports

### 2. Hook Analysis
- Checking hook rules
- Detecting potential dependency problems
- Optimization suggestions

### 3. Performance Analysis
- Detecting unnecessary re-renders
- Checking memoization optimizations
- Analyzing useCallback and useMemo usage

### 4. Debugging
- Automatically adding debug points
- Tracking state updates
- Monitoring side effects

### 5. Accessibility
- Checking ARIA attributes
- Verifying alt text for images
- Checking contrast and semantics

### 6. Optimizations
- Suggestions for using React.memo
- Hook optimization
- State refactoring

### 7. Component Comparison
- Similarity analysis
- Duplication detection
- Code sharing suggestions

## Project Structure

```
reactstream/
├── index.js                  # Main CLI entry point
├── package.json              # Project dependencies and metadata
├── README.md                 # Project documentation
├── commands/                 # CLI command implementations
│   ├── analyze.js            # React component analysis command
│   └── serve.js              # Development server command
└── node_modules/             # Dependencies (generated by npm)
```

## Usage Examples

### Quick Start

```bash
# Analyze a component
reactstream analyze src/components/Button.jsx

# Start a development server
reactstream serve src/components/Button.jsx
```

### Multiple Components

```bash
reactstream serve src/components/Button.jsx src/components/Card.jsx
```

### Help Commands

```bash
reactstream help
reactstream analyze --help
reactstream serve --help
```

### Combined Workflow

```bash
# First analyze
reactstream analyze MyComponent.js --debug

# Then start development server
reactstream serve MyComponent.js --port=3000 --debug
```

## Requirements

- Node.js >= 14.0.0
- npm or yarn

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed information on how to contribute to this project.

## License


