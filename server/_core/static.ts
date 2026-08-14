import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the client public dir across all three deployment layouts:
// 1. Flat production install (deb): /opt/redlinux/index.js + /opt/redlinux/public/
// 2. Standard build layout:        <root>/dist/index.js + <root>/dist/public/
// 3. Development (tsx):            <root>/server/_core  -> <root>/dist/public/
function resolvePublicDir(): string {
  if (fs.existsSync(path.resolve(__dirname, "public", "index.html"))) {
    // Flat deployment — static assets live right next to the bundle.
    return path.resolve(__dirname, "public");
  }
  if (__dirname.endsWith("/dist") || __dirname.endsWith("\\dist")) {
    // Built layout — index.js sits in dist/, assets in dist/public/.
    return path.resolve(__dirname, "public");
  }
  // Development (tsx) — assets are in the repo's dist/public after a build.
  return path.resolve(__dirname, "../..", "dist", "public");
}

const PUBLIC_DIR = resolvePublicDir();

export function serveStatic(app: Express) {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(
      `Could not find the build directory: ${PUBLIC_DIR}, make sure to build the client first`,
    );
  }

  app.use(express.static(PUBLIC_DIR));

  // fall through to index.html if the file doesn't exist
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(PUBLIC_DIR, "index.html"));
  });
}
