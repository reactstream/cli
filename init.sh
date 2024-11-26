#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run command with error checking
run_command() {
    echo -e "${YELLOW}Running: $1${NC}"
    if ! eval "$1"; then
        echo -e "${RED}Failed to execute: $1${NC}"
        exit 1
    fi
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}Please run as root or with sudo${NC}"
        exit 1
    fi
}

# Main setup function
setup_environment() {
    echo -e "${YELLOW}Setting up development environment...${NC}"

    # Enable RPM Fusion repositories
    run_command "dnf install -y https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm"
    run_command "dnf install -y https://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm"

    # Update system
    run_command "dnf update -y"

    # Install required packages
    run_command "dnf install -y \
        java-11-openjdk-devel \
        android-tools \
        gradle \
        git \
        python3-pip \
        qemu-kvm \
        libvirt \
        virt-manager \
        bridge-utils \
        @development-tools \
        zlib-devel \
        libstdc++-static \
        glibc.i686 \
        zlib.i686 \
        ncurses-libs.i686 \
        bzip2-libs.i686"

    # Install Android Studio (optional)
    read -p "Do you want to install Android Studio? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_command "dnf install -y android-studio"
    fi

    # Setup Android SDK
    ANDROID_SDK_ROOT="/opt/android-sdk"
    echo -e "${YELLOW}Setting up Android SDK at $ANDROID_SDK_ROOT${NC}"

    # Create directory for Android SDK
    run_command "mkdir -p $ANDROID_SDK_ROOT"
    run_command "chmod 777 $ANDROID_SDK_ROOT"

    # Download and install Command Line Tools
    CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip"
    run_command "wget $CMDLINE_TOOLS_URL -O /tmp/cmdline-tools.zip"
    run_command "unzip -q /tmp/cmdline-tools.zip -d /tmp"
    run_command "mkdir -p $ANDROID_SDK_ROOT/cmdline-tools"
    run_command "mv /tmp/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest"
    run_command "rm /tmp/cmdline-tools.zip"

    # Set environment variables
    echo "export ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT" >> /etc/profile.d/android.sh
    echo "export PATH=\$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools" >> /etc/profile.d/android.sh
    source /etc/profile.d/android.sh

    # Accept licenses
    yes | sdkmanager --licenses

    # Install required SDK packages
    run_command "sdkmanager \
        'platform-tools' \
        'platforms;android-33' \
        'build-tools;33.0.0' \
        'system-images;android-33;google_apis;x86_64' \
        'emulator'"

    # Setup KVM
    run_command "usermod -a -G libvirt $(whoami)"
    run_command "systemctl enable libvirtd"
    run_command "systemctl start libvirtd"

    # Install Python dependencies for mock API
    run_command "pip3 install flask pytest requests pytest-cov"

    # Create Android Virtual Device
    echo "no" | avdmanager create avd \
        -n test_device \
        -k "system-images;android-33;google_apis;x86_64" \
        --force

    # Final setup steps
    echo -e "${GREEN}Setup completed successfully!${NC}"
    echo -e "${YELLOW}Please run the following commands or restart your terminal:${NC}"
    echo "source /etc/profile.d/android.sh"
    echo -e "${YELLOW}To verify installation:${NC}"
    echo "adb version"
    echo "gradle --version"
    echo "java -version"
}

# Check if script is run as root
check_root

# Run setup
setup_environment

# Print final instructions
echo -e "\n${GREEN}Setup completed! Here are some useful commands:${NC}"
echo -e "adb devices          ${YELLOW}# List connected Android devices${NC}"
echo -e "gradle build         ${YELLOW}# Build your Android project${NC}"
echo -e "emulator -list-avds  ${YELLOW}# List Android Virtual Devices${NC}"
echo -e "emulator -avd test_device ${YELLOW}# Start the test emulator${NC}"

# Check if setup was successful
if command -v adb >/dev/null 2>&1; then
    echo -e "\n${GREEN}ADB is now installed and available!${NC}"
    adb version
else
    echo -e "\n${RED}Something went wrong with ADB installation.${NC}"
    exit 1
fi