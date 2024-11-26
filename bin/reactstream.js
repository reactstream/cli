#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const minimist = require('minimist');
const express = require('express');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

// Parse command line arguments
const argv = minimist(process.argv.slice(2));
const components = argv._;
const port = argv.port || 3000;

if (components.length === 0) {
  console.error(chalk.red('Error: Please specify at least one component to debug'));
  console.log(chalk.yellow('Usage: reactstream ComponentName [AnotherComponent...] [--port=3000]'));
  process.exit(1);
}

// Create temporary directory for development
const tempDir = path.join(process.cwd(), '.reactstream');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Generate development environment
const generateDevEnv = () => {
  // Create index.html
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ReactStream Debug Environment</title>
        <meta charset="UTF-8">
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;
  fs.writeFileSync(path.join(tempDir, 'index.html'), htmlContent);

  // Generate entry point
  const entryContent = `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    ${components.map(comp => `import ${comp} from '${path.resolve(process.cwd(), comp)}';`).join('\n')}

    const App = () => (
      <div style={{ padding: '20px' }}>
        <h1>ReactStream Debug Environment</h1>
        ${components.map(comp => `
          <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc' }}>
            <h2>${comp}</h2>
            <${comp} />
          </div>
        `).join('')}
      </div>
    );

    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  `;
  fs.writeFileSync(path.join(tempDir, 'index.js'), entryContent);
}

// Webpack configuration
const webpackConfig = {
  mode: 'development',
  entry: path.join(tempDir, 'index.js'),
  output: {
    path: tempDir,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'source-map',
};

// Start development server
const startDevServer = () => {
  const compiler = webpack(webpackConfig);
  const devServer = new WebpackDevServer({
    static: {
      directory: tempDir,
    },
    port,
    hot: true,
    open: true,
    client: {
      overlay: true,
    },
  }, compiler);

  devServer.start()
    .then(() => {
      console.log(chalk.green(`\n🚀 ReactStream is running at http://localhost:${port}`));
      console.log(chalk.blue('\nDebugging components:'));
      components.forEach(comp => console.log(chalk.yellow(`- ${comp}`)));
    })
    .catch((err) => {
      console.error(chalk.red('Failed to start development server:'), err);
      process.exit(1);
    });
};

// Main execution
console.log(chalk.blue('🔧 Setting up ReactStream development environment...'));
generateDevEnv();
startDevServer();

// Cleanup on exit
process.on('SIGINT', () => {
  console.log(chalk.blue('\nCleaning up...'));
  fs.rmSync(tempDir, { recursive: true, force: true });
  process.exit();
});