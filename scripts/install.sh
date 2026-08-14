#!/bin/bash
set -e

# ⚡️👾 RedLinux One-Line Installer 👾⚡️
# Pulls the latest .deb from GitHub Releases and installs it.
# Usage:  curl -sSL https://raw.githubusercontent.com/masterfrequency/RedLinux/main/scripts/install.sh | sudo bash

REPO="masterfrequency/RedLinux"
APP="redlinux"

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Must run as root. Use:  curl -sSL https://raw.githubusercontent.com/${REPO}/main/scripts/install.sh | sudo bash" >&2
  exit 1
fi

echo "⚡️👾 RedLinux One-Line Installer 👾⚡️"
echo "→ Resolving latest release from ${REPO}..."

API_JSON="$(curl -sSL "https://api.github.com/repos/${REPO}/releases/latest")"
TAG="$(printf '%s' "${API_JSON}" | grep -oE '"tag_name": *"[^"]+"' | head -1 | sed -E 's/.*"([^"]+)"$/\1/')"
DEB_URL="$(printf '%s' "${API_JSON}" | grep -oE '"browser_download_url": *"[^"]+\.deb"' | head -1 | sed -E 's/.*"(https[^"]+\.deb)"/\1/')"

if [ -z "${TAG}" ] || [ -z "${DEB_URL}" ]; then
  echo "❌ Could not find a .deb asset on the latest release." >&2
  exit 1
fi

echo "→ Release: ${TAG}"
echo "→ Package: ${DEB_URL}"

# Architecture sanity check
LOCAL_ARCH="$(dpkg --print-architecture 2>/dev/null || echo unknown)"
case "${DEB_URL}" in
  *amd64.deb)
    if [ "${LOCAL_ARCH}" != "amd64" ]; then
      echo "⚠️  Package is amd64 but this host is ${LOCAL_ARCH} — install may fail." >&2
    fi
    ;;
esac

TMP_DEB="$(mktemp /tmp/${APP}-XXXXXX.deb)"
trap 'rm -f "${TMP_DEB}"' EXIT

echo "→ Downloading..."
curl -sSL "${DEB_URL}" -o "${TMP_DEB}"

echo "→ Installing..."
dpkg -i "${TMP_DEB}" || apt-get install -f -y

echo ""
echo "✅ RedLinux ${TAG} installed."
echo ""
echo "   Start it:        systemctl start ${APP}   (or just run: ${APP})"
echo "   Enable on boot:  systemctl enable ${APP}"
echo "   Config:          /opt/${APP}/.env   (copy from .env.example)"
