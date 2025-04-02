#!/bin/bash
# upgrade.sh - Script to upgrade all npm dependencies

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting dependency upgrade process...${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check requirements
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

# Create backup of package.json and package-lock.json
echo -e "${BLUE}Creating backups of package files...${NC}"
cp package.json package.json.bak
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.bak
fi

# Option to choose upgrade type
echo -e "${BLUE}What type of upgrade would you like to perform?${NC}"
echo "1) Update all dependencies to latest versions (may include breaking changes)"
echo "2) Update only patch and minor versions (safer)"
echo "3) Update only security vulnerabilities"
read -p "Enter your choice (1-3): " UPGRADE_CHOICE

case $UPGRADE_CHOICE in
    1)
        echo -e "${YELLOW}Upgrading all dependencies to latest versions...${NC}"
        echo -e "${YELLOW}Warning: This might include breaking changes${NC}"
        npm outdated
        echo -e "${BLUE}Updating packages...${NC}"
        npm update --latest
        ;;
    2)
        echo -e "${BLUE}Upgrading dependencies (patches and minor versions only)...${NC}"
        npm outdated
        echo -e "${BLUE}Updating packages...${NC}"
        npm update
        ;;
    3)
        echo -e "${BLUE}Fixing security vulnerabilities only...${NC}"
        npm audit
        echo -e "${BLUE}Fixing vulnerabilities...${NC}"
        npm audit fix
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Check for remaining vulnerabilities
echo -e "${BLUE}Checking for remaining vulnerabilities...${NC}"
npm audit

# Offer to install development dependencies
read -p "Would you like to update devDependencies as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ $UPGRADE_CHOICE -eq 1 ]; then
        npm update --latest --dev
    else
        npm update --dev
    fi
fi

# Verify the upgrade results
echo -e "${BLUE}Current package versions:${NC}"
npm ls --depth=0

echo -e "${GREEN}Dependency upgrade complete!${NC}"
echo -e "${YELLOW}Note: Backup files created: package.json.bak and package-lock.json.bak${NC}"
echo -e "${YELLOW}If anything went wrong, you can restore these files.${NC}"
