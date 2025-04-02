#!/usr/bin/env node
// bin/reactstream-analyze.js

// This script allows direct execution of the analyze command as a standalone binary
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));

// Prepend the 'analyze' command and pass to the main CLI
require('../commands/analyze')(argv);
