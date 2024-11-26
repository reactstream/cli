#!/bin/bash

# Ensure script fails on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting publication process...${NC}"

# Function to extract latest version from CHANGELOG.md
get_latest_version() {
    # Extract the first version number found in CHANGELOG.md
    version=$(grep -m 1 "## \[.*\]" CHANGELOG.md | grep -o "\[.*\]" | tr -d "[]")
    echo $version
}


# Get version and changes
VERSION_CHANGELOG=$(get_latest_version)
if [ -z "$VERSION_CHANGELOG" ]; then
    echo "Error: Could not find version in CHANGELOG.md"
    exit 1
fi

# Update version in setup.py
VERSION_SETUP=$(python setup.py --version)
#sed -i "s/$VERSION_SETUP/$VERSION_CHANGELOG/" setup.py
#sed -i "s/$VERSION_SETUP/$VERSION_CHANGELOG/" setup.cfg
sed -i "s/$VERSION_SETUP/$VERSION_CHANGELOG/" markdown2code/__init__.py

./git.sh

# Check if we're in a clean git state
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}Error: Git working directory is not clean${NC}"
    echo "Please commit or stash your changes first"
    exit 1
fi

# Clean up previous builds
echo -e "${GREEN}Cleaning up previous builds...${NC}"
rm -rf build/ dist/ *.egg-info/

# Install/upgrade build tools
echo -e "${GREEN}Upgrading build tools...${NC}"
python -m pip install --upgrade pip build twine

# Build the package
echo -e "${GREEN}Building package...${NC}"
python -m build

# Check the distribution
echo -e "${GREEN}Checking distribution...${NC}"
twine check dist/*

echo -e "${GREEN}Publishing to PyPI...${NC}"
twine upload dist/*

