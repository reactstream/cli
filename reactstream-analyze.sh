#!/bin/bash
# reactstream-analyze.sh - CLI entry point for ReactStream analyzer

# Forward all arguments to the analyze module
node index.js analyze "$@"
