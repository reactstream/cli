#!/usr/bin/env node
// bin/reactstream-analyze.js

// This script allows direct execution of the analyze command as a standalone binary
require('../index.js')(['analyze'].concat(process.argv.slice(2)));
