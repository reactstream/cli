#!/bin/bash
# version.sh - Clean and prepare for version update

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Cleaning previous build artifacts...${NC}"

# Remove build artifacts
rm -rf node_modules/.cache
rm -rf dist
rm -rf build
rm -rf .reactstream

# Remove any npm debug logs
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

echo -e "${GREEN}Build artifacts cleaned successfully${NC}"

# Current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${YELLOW}$CURRENT_VERSION${NC}"

echo -e "${BLUE}Ready for version update${NC}"
echo -e "Run one of the following commands to update version:"
echo -e "${GREEN}npm version patch${NC} - for bug fixes"
echo -e "${GREEN}npm version minor${NC} - for new features"
echo -e "${GREEN}npm version major${NC} - for breaking changes"
