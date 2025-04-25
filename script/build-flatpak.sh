#!/bin/bash

# Enable strict error handling
set -euo pipefail

# Function to print error messages and exit
error_exit() {
  echo "Error: $1" >&2
  exit 1
}

# Install required flatpak builder
echo "Installing required packages..."
sudo apt update && sudo apt install -y flatpak flatpak-builder || error_exit "Failed to install required packages"
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# Extract runtime version from flatpak.yml
RUNTIME_VERSION=$(grep '^runtime-version:' misc/flatpak.yml | awk -F': ' '{print $2}' | xargs || true)
if [[ -z "$RUNTIME_VERSION" ]]; then
  error_exit "runtime-version not found in misc/flatpak.yml"
fi

# Install Flatpak SDK and Platform
echo "Installing Flatpak SDK and Platform for runtime version $RUNTIME_VERSION..."
flatpak install -y flathub "org.gnome.Platform//$RUNTIME_VERSION" "org.gnome.Sdk//$RUNTIME_VERSION" || error_exit "Failed to install Flatpak SDK and Platform"

# Get .deb output info
DEB_PATH="src-tauri/target/release/bundle/deb"
DEB_FILENAME=$(find "$DEB_PATH" -name "*.deb" -print -quit)
if [[ -z "$DEB_FILENAME" ]]; then
  error_exit "No .deb file was found in $DEB_PATH"
fi

# Get the absolute path of the .deb file
DEB_ABS_PATH=$(realpath "$DEB_FILENAME")
if [[ -z "$DEB_ABS_PATH" ]]; then
  error_exit "Failed to determine the absolute path of the .deb file"
fi

# Calculate SHA256 checksum for the .deb file
OUT_SHA256=$(sha256sum "$DEB_ABS_PATH" | awk '{print $1}' || true)
if [[ -z "$OUT_SHA256" ]]; then
  error_exit "Failed to calculate SHA256 checksum for $DEB_ABS_PATH"
fi

# Update flatpak.yml with the .deb file URL and checksum
echo "Updating misc/flatpak.yml with .deb file info..."
sed -i "s|url:.*|url: file://$DEB_ABS_PATH|" misc/flatpak.yml
sed -i "s|sha256:.*|sha256: $OUT_SHA256|" misc/flatpak.yml

# Build Flatpak
echo "Building Flatpak..."
rm -f *.flatpak
flatpak-builder --force-clean --user --install-deps-from=flathub build misc/flatpak.yml || error_exit "Flatpak build failed"
flatpak build-export export build || error_exit "Flatpak export failed"
flatpak build-bundle export elelem.flatpak net.fionix.elelem || error_exit "Flatpak bundle creation failed"

# Clean up
echo "Cleaning up..."
rm -rf export repo

echo "Flatpak build completed successfully!"