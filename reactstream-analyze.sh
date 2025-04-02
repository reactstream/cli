#!/bin/bash
# reactstream-analyze
# Usage: ./reactstream-analyze MyComponent.js [options]

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run the node script with all arguments passed to this script
node "$DIR/reactstream/src/analyze.js" "$@"
