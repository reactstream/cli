#!/bin/bash
# run.sh - Simple script to set up and run the project

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Check for package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo "Are you in the project root directory?"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi

# Parse command line arguments
if [ "$1" == "analyze" ]; then
    shift
    echo -e "${BLUE}Running analyzer...${NC}"
    node src/analyze.js "$@"
elif [ "$1" == "serve" ]; then
    shift
    echo -e "${BLUE}Starting development server...${NC}"
    node src/index.js "$@"
elif [ "$1" == "help" ] || [ "$1" == "" ]; then
    echo -e "${BLUE}ReactStream CLI${NC}"
    echo ""
    echo "Usage:"
    echo "  ./run.sh analyze <component.js> [options]"
    echo "  ./run.sh serve <component.js> [options]"
    echo ""
    echo "Options for analyze:"
    echo "  --fix          Attempt to automatically fix issues"
    echo "  --debug        Show debug information"
    echo "  --verbose      Show more detailed output"
    echo ""
    echo "Options for serve:"
    echo "  --port=<port>  Specify the port to run the server on (default: 3000)"
    echo ""
    echo "Examples:"
    echo "  ./run.sh analyze MyComponent.js --debug"
    echo "  ./run.sh serve MyComponent.js --port=8080"
else
    echo -e "${RED}Unknown command: $1${NC}"
    echo "Use './run.sh help' for usage information"
    exit 1
fi
