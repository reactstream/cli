#!/usr/bin/env node

// src/reactstream.js - Main implementation file
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const minimist = require('minimist');

// Parse command line arguments
const argv = minimist(process.argv.slice(2));
const command = argv._[0];
const restArgs = argv._.slice(1);

// Remove the command itself from argv._ for subcommands
argv._ = restArgs;

// Show help if no command is provided
if (!command) {
  showHelp();
  process.exit(1);
}

// Create commands directory if it doesn't exist
const commandsDir = path.join(__dirname, '..', 'commands');
if (!fs.existsSync(commandsDir)) {
  fs.mkdirSync(commandsDir, { recursive: true });
}

// Route to the appropriate command
switch (command) {
  case 'analyze':
    try {
      require('../commands/analyze')(argv);
    } catch (error) {
      console.error(chalk.red(`Error loading analyze command: ${error.message}`));
      process.exit(1);
    }
    break;
  case 'serve':
    try {
      require('../commands/serve')(argv);
    } catch (error) {
      console.error(chalk.red(`Error loading serve command: ${error.message}`));
      process.exit(1);
    }
    break;
  case 'help':
    showHelp();
    break;
  default:
    console.error(chalk.red(`Unknown command: ${command}`));
    showHelp();
    process.exit(1);
}

function showHelp() {
  console.log(`
${chalk.bold('ReactStream CLI')} - Tools for React component development

${chalk.bold('USAGE:')}
  reactstream <command> [options] [arguments]

${chalk.bold('COMMANDS:')}
  ${chalk.cyan('analyze')}   Analyze React components for issues and best practices
  ${chalk.cyan('serve')}     Start a development server for testing React components
  ${chalk.cyan('help')}      Show this help message

${chalk.bold('EXAMPLES:')}
  reactstream analyze MyComponent.js --fix
  reactstream serve MyComponent.js --port=8080

Run ${chalk.cyan('reactstream <command> --help')} for more information on a specific command.
  `);
}


