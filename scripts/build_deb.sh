#!/bin/bash
set -e

# PhonkAlphabet's Optimized Supreme .deb Builder
# Version: 4.1.0 (Weaponized + Desktop Integration + Size Optimized)

APP_NAME="redlinux"
VERSION="4.1.0"
ARCH="amd64"
PKG_DIR="${APP_NAME}-${VERSION}-${ARCH}"

echo "⚡️👾 Starting PhonkAlphabet's Optimized Supreme Build Sequence... 👾⚡️"

# 0. Clean any stale staging tree
rm -rf "${PKG_DIR}"

# 1. Clean and Build
if command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
elif command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1; then
  PNPM="corepack pnpm"
else
  echo "❌ pnpm not found — install it: npm install -g pnpm" >&2
  exit 1
fi
"${PNPM}" run build

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
cp client/public/redlinux_icon.png "${PKG_DIR}/usr/share/icons/hicolor/scalable/apps/${APP_NAME}.png"

# Ship a config template — dotenv loads /opt/${APP_NAME}/.env at runtime (systemd WorkingDirectory)
cp .env.example "${PKG_DIR}/opt/${APP_NAME}/.env.example" 2>/dev/null || true

# 5. Generate trimmed production package.json — only the server's runtime
#    dependencies (the client is pre-bundled by Vite; devDependencies like
#    vite/typescript/vitest must NOT be installed on the target box).
node -e '
const root = require("./package.json");
const runtime = [
  "@trpc/server", "axios", "bullmq", "dotenv", "drizzle-orm",
  "express", "express-rate-limit", "helmet", "ioredis", "jimp",
  "mysql2", "nanoid", "openai", "superjson", "zod",
];
const deps = {};
for (const k of runtime) {
  if (!root.dependencies[k]) {
    console.error("Missing runtime dep in root package.json: " + k);
    process.exit(1);
  }
  deps[k] = root.dependencies[k];
}
const out = {
  name: root.name,
  version: root.version,
  private: true,
  type: "module",
  main: "index.js",
  scripts: { start: "node index.js" },
  dependencies: deps,
};
require("fs").writeFileSync(process.argv[1], JSON.stringify(out, null, 2));
' "${PKG_DIR}/opt/${APP_NAME}/package.json"

# 6. Create Post-Install Script to handle dependencies
cat <<EOF > "${PKG_DIR}/DEBIAN/postinst"
#!/bin/bash
set -e
cd /opt/${APP_NAME}
# Install production dependencies (runtime-only, no devDependencies)
if command -v npm >/dev/null 2>&1; then
    npm install --omit=dev --no-audit --no-fund
fi
chmod +x /usr/bin/${APP_NAME}
# Make the systemd unit visible so 'systemctl start redlinux' works right away
if command -v systemctl >/dev/null 2>&1; then
    systemctl daemon-reload >/dev/null 2>&1 || true
fi
EOF
chmod 755 "${PKG_DIR}/DEBIAN/postinst"

# 7. Create Entrypoint Script
cat <<EOF > "${PKG_DIR}/usr/bin/${APP_NAME}"
#!/bin/bash
cd /opt/${APP_NAME} && exec node index.js "\$@"
EOF
chmod +x "${PKG_DIR}/usr/bin/${APP_NAME}"

# 8. Create Desktop Entry
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

# 9. Create Systemd Service
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

# 10. Build Package
dpkg-deb --build "${PKG_DIR}" "${APP_NAME}-${VERSION}-${ARCH}.deb"

# 11. Cleanup
rm -rf "${PKG_DIR}"

echo "⚡️👾 Optimized Supreme Build Complete: ${APP_NAME}-${VERSION}-${ARCH}.deb 👾⚡️"
