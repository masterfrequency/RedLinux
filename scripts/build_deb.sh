#!/bin/bash
set -e

# PhonkAlphabet's Production-Grade .deb Builder
# Version: 4.1.0 (Weaponized)

APP_NAME="redlinux"
VERSION="4.1.0"
ARCH="amd64"
PKG_DIR="${APP_NAME}-${VERSION}-${ARCH}"

echo "⚡️👾 Starting PhonkAlphabet's Weaponized Build Sequence... 👾⚡️"

# 1. Clean and Build
pnpm run build

# 2. Create Debian Structure
mkdir -p "${PKG_DIR}/DEBIAN"
mkdir -p "${PKG_DIR}/usr/bin"
mkdir -p "${PKG_DIR}/opt/${APP_NAME}"
mkdir -p "${PKG_DIR}/etc/systemd/system"

# 3. Create Control File
cat <<EOF > "${PKG_DIR}/DEBIAN/control"
Package: ${APP_NAME}
Version: ${VERSION}
Section: utils
Priority: optional
Architecture: ${ARCH}
Maintainer: PhonkAlphabet <phonk@redlinux.io>
Description: RedLinux Supreme Red Team Operations Framework
 Weaponized V4.1 with EDR Silencing, Polymorphic C2, and Shadow Exfil.
EOF

# 4. Copy Files
cp -r dist/* "${PKG_DIR}/opt/${APP_NAME}/"
cp -r node_modules "${PKG_DIR}/opt/${APP_NAME}/"
cp package.json "${PKG_DIR}/opt/${APP_NAME}/"

# 5. Create Entrypoint Script
cat <<EOF > "${PKG_DIR}/usr/bin/${APP_NAME}"
#!/bin/bash
cd /opt/${APP_NAME} && node index.js
EOF
chmod +x "${PKG_DIR}/usr/bin/${APP_NAME}"

# 6. Create Systemd Service
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

# 7. Build Package
dpkg-deb --build "${PKG_DIR}"
mv "${PKG_DIR}.deb" "${APP_NAME}-${VERSION}-${ARCH}.deb"

# 8. Cleanup
rm -rf "${PKG_DIR}"

echo "⚡️👾 Build Complete: ${APP_NAME}-${VERSION}-${ARCH}.deb 👾⚡️"
