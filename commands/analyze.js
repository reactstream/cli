#!/usr/bin/env node
// command/analyze.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const eslint = require('eslint');

// Define JSX visitor keys for estraverse
const JSX_VISITOR_KEYS = {
    JSXElement: ['openingElement', 'children', 'closingElement'],
    JSXOpeningElement: ['name', 'attributes'],
    JSXClosingElement: ['name'],
    JSXAttribute: ['name', 'value'],
    JSXIdentifier: [],
    JSXExpressionContainer: ['expression'],
    JSXFragment: ['openingFragment', 'children', 'closingFragment'],
    JSXOpeningFragment: [],
    JSXClosingFragment: [],
    JSXText: [],
    JSXSpreadAttribute: ['argument']
};

class ReactStreamAnalyzer {
    constructor(argv) {
        this.components = argv._;
        this.debugMode = argv.debug || false;
        this.fix = argv.fix || false;
        this.verbose = argv.verbose || false;
    }

    async analyze() {
        if (this.components.length === 0) {
            console.error(chalk.red('Error: Please specify components to analyze'));
            console.log(chalk.yellow('Usage: reactstream analyze Component.js [AnotherComponent.js...] [--debug] [--fix] [--verbose]'));
            process.exit(1);
        }

        console.log(chalk.blue('🔍 Starting React component analysis...'));

        for (const component of this.components) {
            await this.analyzeComponent(component);
        }
    }

    async analyzeComponent(componentPath) {
        console.log(chalk.cyan(`\nAnalyzing ${componentPath}...\n`));

        const fullPath = path.resolve(process.cwd(), componentPath);
        if (!fs.existsSync(fullPath)) {
            console.error(chalk.red(`File not found: ${fullPath}`));
            return;
        }

        try {
            const code = fs.readFileSync(fullPath, 'utf-8');
            const results = {
                syntax: await this.checkSyntax(code),
                lint: await this.lintCode(code, fullPath),
                imports: this.analyzeImports(code),
                hooks: this.analyzeHooks(code),
                performance: this.analyzePerformance(code),
                accessibility: this.checkAccessibility(code),
                debugPoints: this.findDebugPoints(code)
            };

            this.displayResults(results, componentPath);

            if (this.fix) {
                await this.fixIssues(code, results, fullPath);
            }
        } catch (error) {
            console.error(chalk.red(`Error analyzing ${componentPath}:`), error);
        }
    }

    async checkSyntax(code) {
        try {
            const ast = esprima.parseModule(code, {
                jsx: true,
                comment: true,
                loc: true
            });

            const issues = [];
            estraverse.traverse(ast, {
                enter: (node) => {
                    // Check for common React issues
                    if (node.type === 'JSXElement') {
                        if (node.openingElement.name.name &&
                            node.openingElement.name.name[0] === node.openingElement.name.name[0].toLowerCase()) {
                            issues.push({
                                type: 'warning',
                                message: `Component names should start with uppercase: ${node.openingElement.name.name}`,
                                line: node.loc.start.line
                            });
                        }
                    }
                },
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return {
                valid: true,
                issues
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message,
                line: error.lineNumber
            };
        }
    }

    async lintCode(code, filePath) {
        const eslintConfig = {
            parser: '@babel/eslint-parser',
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                },
                requireConfigFile: false, // Disable config file checking
                babelOptions: {
                    presets: ['@babel/preset-react']
                }
            },
            env: {
                browser: true,
                es2021: true,
                node: true
            },
            plugins: ['react', 'react-hooks'],
            extends: [
                'eslint:recommended',
                'plugin:react/recommended',
                'plugin:react-hooks/recommended'
            ],
            rules: {
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'warn'
            }
        };

        const linter = new eslint.ESLint({
            baseConfig: eslintConfig,
            fix: this.fix,
            useEslintrc: false // Don't use .eslintrc file
        });

        try {
            const results = await linter.lintText(code, {filePath});
            return results[0];
        } catch (error) {
            console.error(chalk.red("Linting error:"), error);
            return {
                errorCount: 1,
                messages: [{message: error.message, severity: 2}]
            };
        }
    }

    analyzeImports(code) {
        try {
            const ast = esprima.parseModule(code, {jsx: true});
            const imports = [];
            const unusedImports = new Set();

            estraverse.traverse(ast, {
                enter: (node) => {
                    if (node.type === 'ImportDeclaration') {
                        const importInfo = {
                            source: node.source.value,
                            specifiers: node.specifiers.map(spec => spec.local.name)
                        };
                        imports.push(importInfo);
                        importInfo.specifiers.forEach(spec => unusedImports.add(spec));
                    }
                    if (node.type === 'Identifier') {
                        unusedImports.delete(node.name);
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return {
                imports,
                unusedImports: Array.from(unusedImports)
            };
        } catch (error) {
            console.error(chalk.red("Error in analyzeImports:"), error);
            return {
                imports: [],
                unusedImports: []
            };
        }
    }

    analyzeHooks(code) {
        try {
            const ast = esprima.parseModule(code, {jsx: true});
            const hooks = [];
            const hookIssues = [];

            let inComponentScope = false;

            estraverse.traverse(ast, {
                enter: (node) => {
                    if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                        inComponentScope = true;
                    }

                    if (node.type === 'CallExpression' &&
                        node.callee.type === 'Identifier' &&
                        node.callee.name.startsWith('use')) {
                        hooks.push({
                            name: node.callee.name,
                            line: node.loc?.start.line,
                            inComponentScope
                        });

                        if (!inComponentScope) {
                            hookIssues.push({
                                message: `Hook ${node.callee.name} called outside component scope`,
                                line: node.loc?.start.line
                            });
                        }
                    }
                },
                leave: (node) => {
                    if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                        inComponentScope = false;
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return {hooks, hookIssues};
        } catch (error) {
            console.error(chalk.red("Error in analyzeHooks:"), error);
            return {
                hooks: [],
                hookIssues: []
            };
        }
    }

    analyzePerformance(code) {
        try {
            const ast = esprima.parseModule(code, {jsx: true});
            const issues = [];

            estraverse.traverse(ast, {
                enter: (node) => {
                    // Check for inline object creation in JSX
                    if (node.type === 'JSXAttribute' &&
                        node.value?.type === 'JSXExpressionContainer' &&
                        node.value.expression.type === 'ObjectExpression') {
                        issues.push({
                            type: 'performance',
                            message: 'Inline object creation in JSX props can cause unnecessary re-renders',
                            line: node.loc?.start.line
                        });
                    }

                    // Check for array methods without dependencies in useEffect
                    if (node.type === 'CallExpression' &&
                        node.callee.name === 'useEffect' &&
                        node.arguments[1]?.type === 'ArrayExpression' &&
                        node.arguments[1].elements.length === 0) {
                        const effectBody = node.arguments[0];
                        if (effectBody.type === 'ArrowFunctionExpression' ||
                            effectBody.type === 'FunctionExpression') {
                            const hasArrayMethods = this.checkForArrayMethods(effectBody.body);
                            if (hasArrayMethods) {
                                issues.push({
                                    type: 'performance',
                                    message: 'Array methods in useEffect with empty deps array might cause performance issues',
                                    line: node.loc?.start.line
                                });
                            }
                        }
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return issues;
        } catch (error) {
            console.error(chalk.red("Error in analyzePerformance:"), error);
            return [];
        }
    }

    checkForArrayMethods(node) {
        let hasArrayMethods = false;
        try {
            estraverse.traverse(node, {
                enter: (node) => {
                    if (node.type === 'CallExpression' &&
                        node.callee.type === 'MemberExpression' &&
                        ['map', 'filter', 'reduce', 'forEach'].includes(node.callee.property.name)) {
                        hasArrayMethods = true;
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });
        } catch (error) {
            console.error(chalk.red("Error in checkForArrayMethods:"), error);
        }
        return hasArrayMethods;
    }

    checkAccessibility(code) {
        try {
            const ast = esprima.parseModule(code, {jsx: true});
            const issues = [];

            estraverse.traverse(ast, {
                enter: (node) => {
                    if (node.type === 'JSXOpeningElement') {
                        // Check for img tags without alt
                        if (node.name.name === 'img') {
                            const hasAlt = node.attributes.some(attr =>
                                attr.type === 'JSXAttribute' && attr.name.name === 'alt'
                            );
                            if (!hasAlt) {
                                issues.push({
                                    type: 'accessibility',
                                    message: 'Image elements must have alt text',
                                    line: node.loc?.start.line
                                });
                            }
                        }

                        // Check for click handlers on non-button/link elements
                        if (node.attributes.some(attr =>
                            attr.type === 'JSXAttribute' &&
                            attr.name.name === 'onClick'
                        )) {
                            if (!['button', 'a', 'input', 'select'].includes(node.name.name)) {
                                issues.push({
                                    type: 'accessibility',
                                    message: `onClick handler on non-interactive element: ${node.name.name}`,
                                    line: node.loc?.start.line
                                });
                            }
                        }
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return issues;
        } catch (error) {
            console.error(chalk.red("Error in checkAccessibility:"), error);
            return [];
        }
    }

    findDebugPoints(code) {
        try {
            const ast = esprima.parseModule(code, {jsx: true});
            const debugPoints = [];

            estraverse.traverse(ast, {
                enter: (node) => {
                    // Find state updates
                    if (node.type === 'CallExpression' &&
                        node.callee.type === 'Identifier' &&
                        node.callee.name.startsWith('set')) {
                        debugPoints.push({
                            type: 'state-update',
                            location: node.loc?.start.line,
                            message: `State update with ${node.callee.name}`
                        });
                    }

                    // Find effect dependencies
                    if (node.type === 'CallExpression' &&
                        node.callee.name === 'useEffect') {
                        debugPoints.push({
                            type: 'effect',
                            location: node.loc?.start.line,
                            dependencies: node.arguments[1]?.elements?.map(el => el.name) || []
                        });
                    }

                    // Find potential memory leaks
                    if (node.type === 'CallExpression' &&
                        node.callee.name === 'addEventListener') {
                        debugPoints.push({
                            type: 'event-listener',
                            location: node.loc?.start.line,
                            message: 'Check for event listener cleanup'
                        });
                    }
                },
                // Add JSX visitor keys
                keys: Object.assign({}, estraverse.VisitorKeys, JSX_VISITOR_KEYS)
            });

            return debugPoints;
        } catch (error) {
            console.error(chalk.red("Error in findDebugPoints:"), error);
            return [];
        }
    }

    displayResults(results) {
        console.log(chalk.blue('\n=== Analysis Results ===\n'));

        // Syntax check
        if (!results.syntax.valid) {
            console.log(chalk.red('❌ Syntax Error:'));
            console.log(`   Line ${results.syntax.line}: ${results.syntax.error}`);
        } else {
            console.log(chalk.green('✓ Syntax valid'));
            if (results.syntax.issues && results.syntax.issues.length > 0) {
                console.log(chalk.yellow('\nSyntax Warnings:'));
                results.syntax.issues.forEach(issue => {
                    console.log(`   Line ${issue.line}: ${issue.message}`);
                });
            }
        }

        // Linting results
        if (results.lint && (results.lint.errorCount > 0 || results.lint.warningCount > 0)) {
            console.log(chalk.yellow('\nLinting Issues:'));
            results.lint.messages.forEach(msg => {
                const prefix = msg.severity === 2 ? chalk.red('Error') : chalk.yellow('Warning');
                console.log(`   ${prefix} at line ${msg.line}: ${msg.message}`);
            });
        } else {
            console.log(chalk.green('\n✓ No linting issues'));
        }

        // Imports analysis
        console.log(chalk.blue('\nImports Analysis:'));
        if (results.imports && results.imports.imports) {
            results.imports.imports.forEach(imp => {
                console.log(`   • ${imp.source}: ${imp.specifiers.join(', ')}`);
            });
            if (results.imports.unusedImports && results.imports.unusedImports.length > 0) {
                console.log(chalk.yellow('\nUnused Imports:'));
                results.imports.unusedImports.forEach(imp => {
                    console.log(`   • ${imp}`);
                });
            }
        }

        // Hooks analysis
        console.log(chalk.blue('\nHooks Usage:'));
        if (results.hooks && results.hooks.hooks) {
            results.hooks.hooks.forEach(hook => {
                console.log(`   • ${hook.name} (line ${hook.line})`);
            });
            if (results.hooks.hookIssues && results.hooks.hookIssues.length > 0) {
                console.log(chalk.yellow('\nHook Issues:'));
                results.hooks.hookIssues.forEach(issue => {
                    console.log(`   Line ${issue.line}: ${issue.message}`);
                });
            }
        }

        // Performance issues
        if (results.performance && results.performance.length > 0) {
            console.log(chalk.yellow('\nPerformance Considerations:'));
            results.performance.forEach(issue => {
                console.log(`   Line ${issue.line}: ${issue.message}`);
            });
        }

        // Accessibility issues
        if (results.accessibility && results.accessibility.length > 0) {
            console.log(chalk.yellow('\nAccessibility Issues:'));
            results.accessibility.forEach(issue => {
                console.log(`   Line ${issue.line}: ${issue.message}`);
            });
        }

        // Debug points
        if (this.debugMode && results.debugPoints) {
            console.log(chalk.blue('\nDebug Points:'));
            results.debugPoints.forEach(point => {
                console.log(`   • ${point.type} at line ${point.location}`);
                if (point.message) console.log(`     ${point.message}`);
                if (point.dependencies) console.log(`     Dependencies: ${point.dependencies.join(', ')}`);
            });
        }
    }

    async fixIssues(code, results, filePath) {
        if (!this.fix) return;

        console.log(chalk.blue('\nAttempting to fix issues...'));

        let fixedCode = code;

        // Skip syntax issues with escodegen since it doesn't support JSX well
        if (results.syntax.issues && results.syntax.issues.length > 0) {
            console.log(chalk.yellow("Note: Skipping automatic syntax fixes for JSX components. ESCodegen doesn't fully support JSX syntax."));
            // Only apply manual fixes for common issues
            results.syntax.issues.forEach(issue => {
                if (issue.message.includes('Component names should start with uppercase')) {
                    console.log(chalk.blue(`Consider manually fixing: ${issue.message}`));
                }
            });
        }

        // Fix linting issues
        if (results.lint && (results.lint.fixableErrorCount > 0 || results.lint.fixableWarningCount > 0)) {
            try {
                const linter = new eslint.ESLint({fix: true});
                const results = await linter.lintText(fixedCode, {filePath});
                if (results[0].output) {
                    fixedCode = results[0].output;
                }
            } catch (error) {
                console.error(chalk.red("Error fixing linting issues:"), error);
            }
        }

        // Fix unused imports
        if (results.imports && results.imports.unusedImports && results.imports.unusedImports.length > 0) {
            try {
                const ast = esprima.parseModule(fixedCode, {jsx: true});
                const unusedImports = new Set(results.imports.unusedImports);

                // Remove unused imports
                ast.body = ast.body.filter(node => {
                    if (node.type === 'ImportDeclaration') {
                        node.specifiers = node.specifiers.filter(spec =>
                            !unusedImports.has(spec.local.name)
                        );
                        return node.specifiers.length > 0;
                    }
                    return true;
                });

                fixedCode = escodegen.generate(ast, {
                    format: {
                        indent: {
                            style: '  '
                        }
                    }
                });
            } catch (error) {
                console.error(chalk.red("Error fixing unused imports:"), error);
            }
        }

        // Save fixed code
        if (fixedCode !== code) {
            const backupPath = `${filePath}.backup`;
            fs.writeFileSync(backupPath, code); // Create backup
            fs.writeFileSync(filePath, fixedCode);
            console.log(chalk.green(`✓ Fixed issues and saved to ${filePath}`));
            console.log(chalk.blue(`  Original file backed up to ${backupPath}`));
        }
    }

    suggestOptimizations(results) {
        const suggestions = [];

        // Check for potential memo usage
        if (results.performance && results.performance.some(p => p.message.includes('re-renders'))) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using React.memo to prevent unnecessary re-renders',
                priority: 'high'
            });
        }

        // Check for callback optimization
        if (results.hooks && results.hooks.hooks && results.hooks.hooks.some(h => h.name === 'useEffect')) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using useCallback for function props to optimize re-renders',
                priority: 'medium'
            });
        }

        // Check for state optimization
        if (results.hooks && results.hooks.hooks && results.hooks.hooks.filter(h => h.name === 'useState').length > 3) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using useReducer for complex state management',
                priority: 'medium'
            });
        }

        return suggestions;
    }
}

// Export the command handler
module.exports = function(argv) {
    // Check for help flag
    if (argv.help) {
        console.log(`
${chalk.bold('reactstream analyze')} - Analyze React components for issues and best practices

${chalk.bold('USAGE:')}
  reactstream analyze <component1.js> [component2.js...] [options]

${chalk.bold('OPTIONS:')}
  ${chalk.cyan('--fix')}         Attempt to automatically fix issues
  ${chalk.cyan('--debug')}       Show debug information
  ${chalk.cyan('--verbose')}     Show more detailed output
  ${chalk.cyan('--help')}        Show this help message

${chalk.bold('EXAMPLES:')}
  reactstream analyze MyComponent.js
  reactstream analyze src/components/*.js --fix
  `);
        return;
    }

    // Run the analyzer
    const analyzer = new ReactStreamAnalyzer(argv);
    analyzer.analyze().catch(error => {
        console.error(chalk.red('Error during analysis:'), error);
        process.exit(1);
    });
};
