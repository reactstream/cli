#!/bin/bash
# reactstream.sh
# ./reactstream.sh MyComponent.js --port=3000
# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run the node script with all arguments passed to this script
node "$DIR/reactstream/src/index.js" "$@"