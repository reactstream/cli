#!/bin/bash
# version.sh - Comprehensive version management and publishing script

# Detect if being run from npm script to prevent infinite loop
if [ "$npm_lifecycle_event" = "version" ]; then
    echo "Running from npm version hook - skipping automatic versioning"
    exit 0
fi

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

# Function to show help
show_help() {
    echo "Usage: ./version.sh [options]"
    echo "Options:"
    echo "  --major              Increment major version"
    echo "  --minor              Increment minor version"
    echo "  --patch              Increment patch version (default)"
    echo "  --version=X.Y.Z      Set specific version"
    echo "  --skip-changelog     Skip changelog generation"
    echo "  --no-publish         Skip npm publishing"
    echo "  --force              Skip confirmation prompts"
    echo "  -h, --help           Show this help message"
    exit 0
}

# Initial checks
echo -e "${BLUE}Starting version and publish process...${NC}"

# Check if running in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check for required commands
for cmd in npm git; do
    if ! command_exists $cmd; then
        echo -e "${RED}Error: $cmd is not installed${NC}"
        exit 1
    fi
done

# Parse command line arguments
VERSION_TYPE="patch"  # Default to patch version increment
MANUAL_VERSION=""
SKIP_INCREMENT=false
SKIP_CHANGELOG=false
SKIP_PUBLISH=false
FORCE_MODE=false

# Process command line arguments
for arg in "$@"; do
    case $arg in
        --major)
        VERSION_TYPE="major"
        shift
        ;;
        --minor)
        VERSION_TYPE="minor"
        shift
        ;;
        --patch)
        VERSION_TYPE="patch"
        shift
        ;;
        --version=*)
        MANUAL_VERSION="${arg#*=}"
        SKIP_INCREMENT=true
        shift
        ;;
        --skip-changelog)
        SKIP_CHANGELOG=true
        shift
        ;;
        --no-publish)
        SKIP_PUBLISH=true
        shift
        ;;
        --force)
        FORCE_MODE=true
        shift
        ;;
        -h|--help)
        show_help
        ;;
        *)
        echo -e "${RED}Unknown option: $arg${NC}"
        show_help
        ;;
    esac
done

# Clean up previous build artifacts
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

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${YELLOW}$CURRENT_VERSION${NC}"

# Parse current version
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
echo -e "Major: $MAJOR, Minor: $MINOR, Patch: $PATCH"

# Check git status if not in force mode
if [ "$FORCE_MODE" = false ]; then
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}Warning: Git working directory is not clean${NC}"
        echo "You may want to commit your changes first"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Process aborted${NC}"
            exit 1
        fi
    fi
fi

# Interactive version selection if not specified and not in force mode
if [ "$SKIP_INCREMENT" = false ] && [ "$FORCE_MODE" = false ] && [ -t 0 ]; then  # Check if running in terminal
    echo -e "${BLUE}What kind of version update is this?${NC}"
    echo "1) patch (bug fixes) [DEFAULT]"
    echo "2) minor (new features)"
    echo "3) major (breaking changes)"
    echo "4) custom (specify version)"
    read -p "Enter your choice [1-4] or press Enter for patch: " VERSION_CHOICE

    # Default to patch if no input
    VERSION_CHOICE=${VERSION_CHOICE:-1}

    case $VERSION_CHOICE in
        1|"")
            VERSION_TYPE="patch"
            ;;
        2)
            VERSION_TYPE="minor"
            ;;
        3)
            VERSION_TYPE="major"
            ;;
        4)
            read -p "Enter custom version (e.g., 1.2.3): " CUSTOM_VERSION
            MANUAL_VERSION="$CUSTOM_VERSION"
            SKIP_INCREMENT=true
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Calculate new version if not manually specified
if [ "$SKIP_INCREMENT" = false ]; then
    echo -e "${BLUE}Incrementing ${VERSION_TYPE} version...${NC}"

    case $VERSION_TYPE in
        major)
        NEW_MAJOR=$((MAJOR + 1))
        NEW_VERSION="${NEW_MAJOR}.0.0"
        ;;
        minor)
        NEW_MINOR=$((MINOR + 1))
        NEW_VERSION="${MAJOR}.${NEW_MINOR}.0"
        ;;
        patch)
        NEW_PATCH=$((PATCH + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"
        ;;
    esac
else
    NEW_VERSION=$MANUAL_VERSION
    echo -e "${BLUE}Setting version to ${YELLOW}${NEW_VERSION}${NC}"
fi

# Generate changelog entry if needed
if [ "$SKIP_CHANGELOG" = false ]; then
    echo -e "${BLUE}Generating changelog entry...${NC}"

    # Check if CHANGELOG.md exists, create if it doesn't
    if [ ! -f "CHANGELOG.md" ]; then
        echo "# Changelog" > CHANGELOG.md
        echo "" >> CHANGELOG.md
    fi

    # Get git log since last version tag
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    CHANGELOG_TEMP=$(mktemp)

    echo "## [${NEW_VERSION}] - $(date +%Y-%m-%d)" > "$CHANGELOG_TEMP"
    echo "" >> "$CHANGELOG_TEMP"

    if [ -n "$LAST_TAG" ]; then
        # Get commits since last tag
        echo "### Changes since ${LAST_TAG}" >> "$CHANGELOG_TEMP"
        echo "" >> "$CHANGELOG_TEMP"
        git log ${LAST_TAG}..HEAD --pretty=format:"* %s" | grep -v "Merge" >> "$CHANGELOG_TEMP" || true
    else
        # If no tags yet, get all commits
        echo "### Changes" >> "$CHANGELOG_TEMP"
        echo "" >> "$CHANGELOG_TEMP"
        git log --pretty=format:"* %s" | grep -v "Merge" >> "$CHANGELOG_TEMP" || true
    fi
    echo "" >> "$CHANGELOG_TEMP"
    echo "" >> "$CHANGELOG_TEMP"

    # Prepend new changelog to existing file
    CHANGELOG_CONTENT=$(cat CHANGELOG.md)
    cat "$CHANGELOG_TEMP" > CHANGELOG.md
    echo "$CHANGELOG_CONTENT" >> CHANGELOG.md
    rm "$CHANGELOG_TEMP"

    echo -e "${GREEN}Changelog updated${NC}"
fi

# Update version in package.json directly (without npm version to avoid hooks)
echo -e "${BLUE}Updating version in package.json...${NC}"
# Use a temporary file to update package.json
TEMP_FILE=$(mktemp)
node -e "
    const fs = require('fs');
    const pkg = require('./package.json');
    pkg.version = '$NEW_VERSION';
    fs.writeFileSync('$TEMP_FILE', JSON.stringify(pkg, null, 2) + '\n');
" && mv "$TEMP_FILE" package.json

# Run linting
echo -e "${BLUE}Running linting...${NC}"
npm run lint || {
    echo -e "${YELLOW}Linting found issues.${NC}"
    if [ "$FORCE_MODE" = false ]; then
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Process aborted${NC}"
            exit 1
        fi
    fi
}

# Run tests if available
echo -e "${BLUE}Running tests...${NC}"
npm test || {
    echo -e "${YELLOW}Tests failed or no tests available.${NC}"
    if [ "$FORCE_MODE" = false ]; then
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Process aborted${NC}"
            exit 1
        fi
    fi
}

# Commit changes
echo -e "${BLUE}Committing version update...${NC}"
git add package.json CHANGELOG.md
# Add package-lock.json if it exists and not ignored
if [ -f "package-lock.json" ]; then
    git add package-lock.json 2>/dev/null || echo -e "${YELLOW}Note: package-lock.json is ignored by .gitignore${NC}"
fi
git commit -m "Version bump to $NEW_VERSION"

# Create git tag
echo -e "${BLUE}Creating git tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Version $NEW_VERSION"

# Push to GitHub
echo -e "${BLUE}Pushing changes and tags to GitHub...${NC}"
git push origin main || echo -e "${YELLOW}Warning: Could not push to main branch${NC}"
git push origin --tags || echo -e "${YELLOW}Warning: Could not push tags${NC}"

# Publish to npm if not skipped
if [ "$SKIP_PUBLISH" = false ]; then
    echo -e "${BLUE}Publishing to npm...${NC}"
    npm publish --access=public
    echo -e "${GREEN}Successfully published version $NEW_VERSION to npm${NC}"
else
    echo -e "${YELLOW}Skipping npm publish as requested${NC}"
    echo -e "${GREEN}Version $NEW_VERSION is ready for publishing${NC}"
    echo -e "Run ${BLUE}npm publish --access=public${NC} to publish manually"
fi

echo -e "${GREEN}Version process completed successfully!${NC}"
