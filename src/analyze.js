#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const minimist = require('minimist');
const {execSync} = require('child_process');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const eslint = require('eslint');
const ReactDOM = require('react-dom/server');

class ReactStreamAnalyzer {
    constructor() {
        this.argv = minimist(process.argv.slice(2));
        this.components = this.argv._;
        this.debugMode = this.argv.debug || false;
        this.fix = this.argv.fix || false;
        this.verbose = this.argv.verbose || false;
    }

    async analyze() {
        if (this.components.length === 0) {
            console.error(chalk.red('Error: Please specify components to analyze'));
            console.log(chalk.yellow('Usage: reactstream-analyze Component.js [AnotherComponent.js...] [--debug] [--fix] [--verbose]'));
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
                }
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
                }
            },
            env: {
                browser: true,
                es2021: true
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
            fix: this.fix
        });

        try {
            const results = await linter.lintText(code, {filePath});
            return results[0];
        } catch (error) {
            return {
                errorCount: 1,
                messages: [{message: error.message, severity: 2}]
            };
        }
    }

    analyzeImports(code) {
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
            }
        });

        return {
            imports,
            unusedImports: Array.from(unusedImports)
        };
    }

    analyzeHooks(code) {
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
            }
        });

        return {hooks, hookIssues};
    }

    analyzePerformance(code) {
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
            }
        });

        return issues;
    }

    checkForArrayMethods(node) {
        let hasArrayMethods = false;
        estraverse.traverse(node, {
            enter: (node) => {
                if (node.type === 'CallExpression' &&
                    node.callee.type === 'MemberExpression' &&
                    ['map', 'filter', 'reduce', 'forEach'].includes(node.callee.property.name)) {
                    hasArrayMethods = true;
                }
            }
        });
        return hasArrayMethods;
    }

    checkAccessibility(code) {
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
            }
        });

        return issues;
    }

    findDebugPoints(code) {
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
            }
        });

        return debugPoints;
    }

    displayResults(results, componentPath) {
        console.log(chalk.blue('\n=== Analysis Results ===\n'));

        // Syntax check
        if (!results.syntax.valid) {
            console.log(chalk.red('❌ Syntax Error:'));
            console.log(`   Line ${results.syntax.line}: ${results.syntax.error}`);
        } else {
            console.log(chalk.green('✓ Syntax valid'));
            if (results.syntax.issues.length > 0) {
                console.log(chalk.yellow('\nSyntax Warnings:'));
                results.syntax.issues.forEach(issue => {
                    console.log(`   Line ${issue.line}: ${issue.message}`);
                });
            }
        }

        // Linting results
        if (results.lint.errorCount > 0 || results.lint.warningCount > 0) {
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
        results.imports.imports.forEach(imp => {
            console.log(`   • ${imp.source}: ${imp.specifiers.join(', ')}`);
        });
        if (results.imports.unusedImports.length > 0) {
            console.log(chalk.yellow('\nUnused Imports:'));
            results.imports.unusedImports.forEach(imp => {
                console.log(`   • ${imp}`);
            });
        }

        // Hooks analysis
        console.log(chalk.blue('\nHooks Usage:'));
        results.hooks.hooks.forEach(hook => {
            console.log(`   • ${hook.name} (line ${hook.line})`);
        });
        if (results.hooks.hookIssues.length > 0) {
            console.log(chalk.yellow('\nHook Issues:'));
            results.hooks.hookIssues.forEach(issue => {
                console.log(`   Line ${issue.line}: ${issue.message}`);
            });
        }

        // Performance issues
        if (results.performance.length > 0) {
            console.log(chalk.yellow('\nPerformance Considerations:'));
            results.performance.forEach(issue => {
                console.log(`   Line ${issue.line}: ${issue.message}`);
            });
        }

        // Accessibility issues
        if (results.accessibility.length > 0) {
            console.log(chalk.yellow('\nAccessibility Issues:'));
            results.accessibility.forEach(issue => {
                console.log(`   Line ${issue.line}: ${issue.message}`);
            });
        }

        // Debug points
        if (this.debugMode) {
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

        // Fix syntax issues
        if (results.syntax.issues.length > 0) {
            const ast = esprima.parseModule(fixedCode, {jsx: true});
            fixedCode = escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '  '
                    }
                }
            });
        }

        // Fix linting issues
        if (results.lint.fixableErrorCount > 0 || results.lint.fixableWarningCount > 0) {
            const linter = new eslint.ESLint({fix: true});
            const results = await linter.lintText(fixedCode, {filePath});
            if (results[0].output) {
                fixedCode = results[0].output;
            }
        }

        // Fix unused imports
        if (results.imports.unusedImports.length > 0) {
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

    addDebugger(code) {
        const ast = esprima.parseModule(code, {jsx: true});
        let modified = false;

        estraverse.traverse(ast, {
            enter: (node) => {
                if (node.type === 'CallExpression' &&
                    node.callee.type === 'Identifier' &&
                    node.callee.name.startsWith('use')) {
                    // Add debugger before hook calls
                    modified = true;
                    return {
                        type: 'BlockStatement',
                        body: [
                            {
                                type: 'DebuggerStatement'
                            },
                            {
                                type: 'ExpressionStatement',
                                expression: node
                            }
                        ]
                    };
                }
            }
        });

        if (modified) {
            return escodegen.generate(ast, {
                format: {
                    indent: {
                        style: '  '
                    }
                }
            });
        }

        return code;
    }

    compareComponents(component1Path, component2Path) {
        const code1 = fs.readFileSync(component1Path, 'utf-8');
        const code2 = fs.readFileSync(component2Path, 'utf-8');

        const analysis1 = this.analyzeComponent(component1Path);
        const analysis2 = this.analyzeComponent(component2Path);

        console.log(chalk.blue('\n=== Component Comparison ===\n'));

        // Compare imports
        console.log(chalk.yellow('Imports Comparison:'));
        const imports1 = new Set(analysis1.imports.imports.map(i => i.source));
        const imports2 = new Set(analysis2.imports.imports.map(i => i.source));

        console.log('Shared imports:',
            [...imports1].filter(i => imports2.has(i)));
        console.log('Unique to component 1:',
            [...imports1].filter(i => !imports2.has(i)));
        console.log('Unique to component 2:',
            [...imports2].filter(i => !imports1.has(i)));

        // Compare hooks usage
        console.log(chalk.yellow('\nHooks Usage:'));
        const hooks1 = new Set(analysis1.hooks.hooks.map(h => h.name));
        const hooks2 = new Set(analysis2.hooks.hooks.map(h => h.name));

        console.log('Shared hooks:',
            [...hooks1].filter(h => hooks2.has(h)));
        console.log('Unique to component 1:',
            [...hooks1].filter(h => !hooks2.has(h)));
        console.log('Unique to component 2:',
            [...hooks2].filter(h => !hooks1.has(h)));

        // Compare performance metrics
        console.log(chalk.yellow('\nPerformance Issues:'));
        console.log('Component 1:', analysis1.performance.length);
        console.log('Component 2:', analysis2.performance.length);

        // Compare accessibility issues
        console.log(chalk.yellow('\nAccessibility Issues:'));
        console.log('Component 1:', analysis1.accessibility.length);
        console.log('Component 2:', analysis2.accessibility.length);

        return {
            imports: {
                shared: [...imports1].filter(i => imports2.has(i)),
                unique1: [...imports1].filter(i => !imports2.has(i)),
                unique2: [...imports2].filter(i => !imports1.has(i))
            },
            hooks: {
                shared: [...hooks1].filter(h => hooks2.has(h)),
                unique1: [...hooks1].filter(h => !hooks2.has(h)),
                unique2: [...hooks2].filter(h => !hooks1.has(h))
            },
            performance: {
                component1: analysis1.performance.length,
                component2: analysis2.performance.length
            },
            accessibility: {
                component1: analysis1.accessibility.length,
                component2: analysis2.accessibility.length
            }
        };
    }

    suggestOptimizations(results) {
        const suggestions = [];

        // Check for potential memo usage
        if (results.performance.some(p => p.message.includes('re-renders'))) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using React.memo to prevent unnecessary re-renders',
                priority: 'high'
            });
        }

        // Check for callback optimization
        if (results.hooks.hooks.some(h => h.name === 'useEffect')) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using useCallback for function props to optimize re-renders',
                priority: 'medium'
            });
        }

        // Check for state optimization
        if (results.hooks.hooks.filter(h => h.name === 'useState').length > 3) {
            suggestions.push({
                type: 'optimization',
                message: 'Consider using useReducer for complex state management',
                priority: 'medium'
            });
        }

        return suggestions;
    }
}

// Export the analyzer
module.exports = ReactStreamAnalyzer;

// CLI execution
if (require.main === module) {
    const analyzer = new ReactStreamAnalyzer();
    analyzer.analyze().catch(error => {
        console.error(chalk.red('Error during analysis:'), error);
        process.exit(1);
    });
}