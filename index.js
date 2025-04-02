#!/usr/bin/env node
// index.js - Main CLI entry point

// Support both direct execution and programmatic usage
const runCli = (args) => {
    const argv = args || process.argv.slice(2);
    require('./src/reactstream')(argv);
};

// If called directly as script
if (require.main === module) {
    runCli();
}

// Export for programmatic usage
module.exports = runCli;
