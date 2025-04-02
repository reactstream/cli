#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const minimist = require('minimist');
const { execSync } = require('child_process');

// Parse command line arguments
const argv = minimist(process.argv.slice(2));
const components = argv._;
const port = argv.port || 3000;

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Error: Please specify at least one component to debug');
    console.error('Usage: reactstream ComponentName [AnotherComponent...] [--port=3000]');
    process.exit(1);
}

if (components.length === 0) {
    console.error(chalk.red('Error: Please specify at least one component to debug'));
    console.log(chalk.yellow('Usage: reactstream ComponentName [AnotherComponent...] [--port=3000]'));
    process.exit(1);
}

// Create temporary directory for development
const tempDir = path.join(process.cwd(), '.reactstream');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Helper function to get component name from file path
const getComponentInfo = (filePath) => {
    const fullPath = path.resolve(process.cwd(), filePath);
    const name = path.basename(filePath, path.extname(filePath));
    return {
        name,
        path: fullPath
    };
};

// Helper function to create UI components directory and files
const createUIComponents = () => {
    const componentsDir = path.join(tempDir, 'components', 'ui');
    fs.mkdirSync(componentsDir, { recursive: true });

    // Create card.jsx
    const cardContent = `
import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={\`card \${className}\`}>{children}</div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={\`card-header \${className}\`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={\`card-title \${className}\`}>{children}</h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={\`card-content \${className}\`}>{children}</div>
);
`;

    // Create tabs.jsx
    const tabsContent = `
import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { activeTab, setActiveTab });
    }
    return child;
  });

  return (
    <div className="tabs-container">
      {childrenWithProps}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="tabs-list">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, setActiveTab });
      }
      return child;
    })}
  </div>
);

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button 
    className={\`tab-trigger \${activeTab === value ? 'active' : ''}\`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) => (
  <div className={\`tab-content \${activeTab === value ? 'active' : 'hidden'}\`}>
    {children}
  </div>
);
`;

    // Create alert.jsx
    const alertContent = `
import React from 'react';

export const Alert = ({ children, className = '' }) => (
  <div className={\`alert \${className}\`}>{children}</div>
);

export const AlertTitle = ({ children, className = '' }) => (
  <h5 className={\`alert-title \${className}\`}>{children}</h5>
);

export const AlertDescription = ({ children, className = '' }) => (
  <div className={\`alert-description \${className}\`}>{children}</div>
);
`;

    fs.writeFileSync(path.join(componentsDir, 'card.jsx'), cardContent);
    fs.writeFileSync(path.join(componentsDir, 'tabs.jsx'), tabsContent);
    fs.writeFileSync(path.join(componentsDir, 'alert.jsx'), alertContent);

    // Create styles.css
    const stylesContent = `
/* Base styles */
:root {
  --primary: #0070f3;
  --background: white;
  --text: #333;
  --border: #e2e8f0;
}

/* Card styles */
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.card-header {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.card-content {
  padding: 0.5rem 0;
}

/* Tabs styles */
.tabs-container {
  width: 100%;
}

.tabs-list {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}

.tab-trigger {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text);
  border-bottom: 2px solid transparent;
}

.tab-trigger:hover {
  color: var(--primary);
}

.tab-trigger.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  padding: 1rem 0;
}

.tab-content.hidden {
  display: none;
}

/* Alert styles */
.alert {
  background: #f8f9fa;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
}

.alert-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.alert-description {
  font-size: 0.875rem;
  color: #666;
}
`;

    fs.writeFileSync(path.join(tempDir, 'styles.css'), stylesContent);
};

// Generate package.json
const generatePackageJson = () => {
    const packageJson = {
        "name": "reactstream-temp",
        "version": "1.0.0",
        "private": true,
        "dependencies": {
            "react": "^17.0.2",
            "react-dom": "^17.0.2",
            "@babel/runtime": "^7.12.5"
        },
        "devDependencies": {
            "@babel/core": "^7.12.10",
            "@babel/preset-env": "^7.12.11",
            "@babel/preset-react": "^7.12.10",
            "@babel/plugin-transform-runtime": "^7.12.10",
            "babel-loader": "^8.2.5",
            "webpack": "^4.46.0",
            "webpack-dev-server": "^3.11.3",
            "webpack-cli": "^3.3.12",
            "style-loader": "^2.0.0",
            "css-loader": "^5.2.7"
        }
    };

    fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );
};


// Generate webpack config
const generateWebpackConfig = () => {
    const webpackConfig = `
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:${port}',
    'webpack/hot/only-dev-server',
    path.join(__dirname, 'index.js')
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    }
  },
  module: {
    rules: [
      {
        test: /\\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('@babel/preset-env'), {
                targets: {
                  browsers: ['last 2 versions']
                }
              }],
              [require.resolve('@babel/preset-react'), {
                runtime: 'automatic'
              }]
            ],
            plugins: [
              require.resolve('@babel/plugin-transform-runtime')
            ]
          }
        }
      },
      {
        test: /\\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  devtool: 'cheap-module-source-map'
};`;

    fs.writeFileSync(path.join(tempDir, 'webpack.config.js'), webpackConfig);
};

// Generate HTML template
const generateHtmlTemplate = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>ReactStream Debug Environment</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>`;

    fs.writeFileSync(path.join(tempDir, 'index.html'), htmlContent);
};

// Generate entry point
const generateEntryPoint = (componentInfos) => {
    const entryContent = `
import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
${componentInfos.map((comp, index) =>
        `import Component${index} from '${comp.path}';`
    ).join('\n')}

const App = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        ReactStream Debug Environment
      </h1>
      ${componentInfos.map((comp, index) => `
        <div key="${comp.name}" style={{ marginTop: '20px' }}>
          <h2 style={{ color: '#666', fontSize: '1.2rem', marginBottom: '10px' }}>
            ${comp.name}
          </h2>
          <Component${index} />
        </div>
      `).join('')}
    </div>
  );
};

const root = document.getElementById('root');
ReactDOM.render(<App />, root);

// Enable Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
`;

    fs.writeFileSync(path.join(tempDir, 'index.js'), entryContent);
};


// Install dependencies
const installDependencies = () => {
    console.log(chalk.blue('📦 Installing dependencies...'));
    execSync('npm install', {
        cwd: tempDir,
        stdio: 'inherit'
    });
};

// Start development server
const startDevServer = () => {
    console.log(chalk.blue('🚀 Starting development server...'));
    execSync(
        `"${path.join(tempDir, 'node_modules/.bin/webpack-dev-server')}" --config webpack.config.js --port ${port} --hot --host 0.0.0.0 --disable-host-check --watch-poll --open`,
        {
            cwd: tempDir,
            stdio: 'inherit',
            env: {
                ...process.env,
                BABEL_ENV: 'development',
                NODE_ENV: 'development'
            }
        }
    );
};

// Main execution
const main = async () => {
    console.log(chalk.blue('🔧 Setting up ReactStream development environment...'));

    const componentInfos = components.map(getComponentInfo);

    // Create all necessary files and directories
    createUIComponents();
    generatePackageJson();
    generateWebpackConfig();
    generateHtmlTemplate();
    generateEntryPoint(componentInfos);

    // Install dependencies and start server
    installDependencies();
    startDevServer();
};

// Cleanup on exit
process.on('SIGINT', () => {
    console.log(chalk.blue('\nCleaning up...'));
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.exit();
});

// Run the script
main().catch(error => {
    console.error(chalk.red('Error:', error));
    process.exit(1);
});
