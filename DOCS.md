# ReactStream Documentation

## Overview
ReactStream is a comprehensive development and analysis toolkit for React components. It integrates two powerful tools into a single CLI interface:
1. **ReactStream Serve** - For real-time component development and testing
2. **ReactStream Analyze** - For code analysis, debugging, and optimization

## Installation

```bash
# Global installation
npm install -g reactstream

# Local project installation
npm install --save-dev reactstream

# Or install from source
git clone https://github.com/reactstream/cli
cd reactstream
npm install
npm link
```

## Quick Start

```bash
# Analyze a component
reactstream analyze MyComponent.js --debug

# Start development server
reactstream serve MyComponent.js --port=3000
```

## Unified CLI Commands

ReactStream now uses a unified command interface with subcommands:

```bash
reactstream <command> [options] [arguments]
```

### Available Commands

```bash
reactstream analyze <component1.js> [component2.js...] [options]
reactstream serve <component1.js> [component2.js...] [options]
reactstream help
```

## ReactStream Serve Features

### Component Development
- Hot Module Replacement (HMR)
- Isolated component testing
- Built-in UI component library
- Automatic dependency management
- Real-time preview
- Custom port configuration

### Built-in Components
- Card system
- Tab navigation
- Alert components
- Form elements
- Layout utilities

### Development Environment
- Automatic setup and cleanup
- Webpack configuration
- Babel integration
- CSS processing
- Asset handling

## ReactStream Analyze Features

### Code Analysis
- Syntax validation
- Best practices checking
- Hook rules verification
- Performance optimization
- Accessibility testing

### Debugging Tools
- Automatic debugger insertion
- State tracking
- Effect monitoring
- Performance profiling

### Optimization
- Component comparison
- Code duplication detection
- Import optimization
- Performance suggestions

## Command Options

### analyze
```bash
reactstream analyze [component] [options]

Options:
  --debug     Enable debug mode
  --fix       Auto-fix issues
  --verbose   Detailed output
```

### serve
```bash
reactstream serve [component] [options]

Options:
  --port=<port>  Specify the port to run the server on (default: 3000)
```

## Configuration

### DevServer Config
```javascript
{
  port: 3000,
  hot: true,
  open: true,
  components: {
    path: './src/components',
    extensions: ['.js', '.jsx']
  }
}
```

### Analyzer Config
```javascript
{
  debug: false,
  fix: false,
  verbose: false,
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
}
```

## Advanced Usage

### Component Analysis

ReactStream analyze performs detailed analysis of React components:

1. **Syntax Validation**
   - Checks JSX syntax correctness
   - Ensures proper component structure
   - Validates import/export statements

2. **Hook Analysis**
   - Ensures hooks are used according to React's rules
   - Checks for proper dependencies in useEffect, useMemo, and useCallback
   - Detects potential issues with hook ordering

3. **Performance Analysis**
   - Identifies unnecessary re-renders
   - Detects inline object creation in JSX
   - Suggests memoization opportunities

4. **Accessibility Analysis**
   - Checks for proper alt text on images
   - Detects incorrect onClick handlers on non-interactive elements
   - Ensures ARIA attributes are used correctly

### Development Server

The development server provides a robust environment for testing components:

1. **Isolated Testing**
   - Renders components in a clean environment
   - Provides built-in UI components for testing
   - Supports multiple components simultaneously

2. **Hot Module Replacement**
   - Instant feedback on changes
   - Preserves component state during updates
   - Accelerates development workflow

3. **Built-in Components**
   - Card system for component display
   - Tab navigation for multiple views
   - Alert components for notifications

## Best Practices

1. **Component Development**
   - Use isolated testing with `reactstream serve`
   - Enable debug mode for detailed information
   - Test components with different props and states

2. **Code Analysis**
   - Run `reactstream analyze` before commits
   - Address critical issues first
   - Review performance suggestions
   - Maintain accessibility standards

3. **Optimization**
   - Regular code analysis
   - Component comparisons
   - Performance monitoring
   - Regular dependency updates

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Use a different port if the default is in use
   reactstream serve MyComponent.js --port=8080
   ```

2. **ESLint Configuration**
   - The analyzer uses a default ESLint configuration
   - It doesn't require a .eslintrc file in your project

3. **JSX Transformation**
   - If you're using non-standard JSX transformations, you may need to adjust your Babel configuration

4. **Analysis Errors**
   - Try running with `--debug` flag for more detailed error information
   - Check if your component syntax is valid

## Contributing

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to ReactStream.

## License

