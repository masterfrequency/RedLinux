#!/bin/bash
set -e

# PhonkAlphabet's Optimized Supreme .deb Builder
# Version: 4.1.0 (Weaponized + Desktop Integration + Size Optimized)

APP_NAME="redlinux"
VERSION="4.1.0"
ARCH="amd64"
PKG_DIR="${APP_NAME}-${VERSION}-${ARCH}"

echo "⚡️👾 Starting PhonkAlphabet's Optimized Supreme Build Sequence... 👾⚡️"

# 1. Clean and Build
pnpm run build

# 2. Create Debian Structure
mkdir -p "${PKG_DIR}/DEBIAN"
mkdir -p "${PKG_DIR}/usr/bin"
mkdir -p "${PKG_DIR}/opt/${APP_NAME}"
mkdir -p "${PKG_DIR}/etc/systemd/system"
mkdir -p "${PKG_DIR}/usr/share/applications"
mkdir -p "${PKG_DIR}/usr/share/icons/hicolor/scalable/apps"

# 3. Create Control File
cat <<EOF > "${PKG_DIR}/DEBIAN/control"
Package: ${APP_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Maintainer: PhonkAlphabet <phonk@redlinux.io>
Depends: nodejs (>= 18.0.0)
Description: RedLinux Supreme Red Team Operations Framework
 Weaponized V4.1 with EDR Silencing, Polymorphic C2, and Shadow Exfil.
 Includes Desktop Integration, Supreme UI, and Animated HUD.
 Size optimized for high-speed deployment.
EOF

# 4. Copy Files (Optimized: Exclude node_modules, user must run npm install or we bundle only essentials)
# For a real production deb, we bundle the dist and a production-only package.json
cp -r dist/* "${PKG_DIR}/opt/${APP_NAME}/"
cp package.json "${PKG_DIR}/opt/${APP_NAME}/"
cp client/public/redlinux_icon.png "${PKG_DIR}/usr/share/icons/hicolor/scalable/apps/${APP_NAME}.png"

# 5. Create Post-Install Script to handle dependencies
cat <<EOF > "${PKG_DIR}/DEBIAN/postinst"
#!/bin/bash
cd /opt/${APP_NAME}
# Check if npm is available and install production dependencies
if command -v npm >/dev/null 2>&1; then
    npm install --production --no-audit --no-fund
fi
chmod +x /usr/bin/${APP_NAME}
EOF
chmod 755 "${PKG_DIR}/DEBIAN/postinst"

# 6. Create Entrypoint Script
cat <<EOF > "${PKG_DIR}/usr/bin/${APP_NAME}"
#!/bin/bash
cd /opt/${APP_NAME} && node index.js
EOF
chmod +x "${PKG_DIR}/usr/bin/${APP_NAME}"

# 7. Create Desktop Entry
cat <<EOF > "${PKG_DIR}/usr/share/applications/${APP_NAME}.desktop"
[Desktop Entry]
Name=RedLinux Supreme
Comment=Red Team Operations Framework
Exec=/usr/bin/${APP_NAME}
Icon=${APP_NAME}
Terminal=false
Type=Application
Categories=Security;Development;
EOF

# 8. Create Systemd Service
cat <<EOF > "${PKG_DIR}/etc/systemd/system/${APP_NAME}.service"
[Unit]
Description=RedLinux Supreme Framework
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/${APP_NAME}
ExecStart=/usr/bin/node /opt/${APP_NAME}/index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 9. Build Package
dpkg-deb --build "${PKG_DIR}"
mv "${PKG_DIR}.deb" "${APP_NAME}-${VERSION}-${ARCH}.deb"

# 10. Cleanup
rm -rf "${PKG_DIR}"

echo "⚡️👾 Optimized Supreme Build Complete: ${APP_NAME}-${VERSION}-${ARCH}.deb 👾⚡️"
