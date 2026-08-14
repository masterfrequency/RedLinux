import { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

// Resolve the project root directory
// In development (tsx): __dirname = server/_core/, so PROJECT_ROOT = ../.. = project root
// In production (built dist/index.js): __dirname = dist/, so PROJECT_ROOT = .. = project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Detect if we're running from the built dist directory or source
const isBuilt = __dirname.endsWith("/dist") || __dirname.endsWith("\\dist");
const PROJECT_ROOT = isBuilt
  ? path.resolve(__dirname, "..")
  : path.resolve(__dirname, "../..");

export async function setupVite(app: Express, server: Server) {
  // Dev-only: vite, its plugins and vite.config are devDependencies. They are
  // imported lazily (and with a runtime-computed specifier for the config) so
  // the production bundle never resolves them at module load — otherwise the
  // deb crashes on boot with ERR_MODULE_NOT_FOUND after `npm install --omit=dev`.
  const { createServer: createViteServer } = await import("vite");
  const viteConfigUrl = pathToFileURL(
    path.resolve(PROJECT_ROOT, "vite.config.ts"),
  ).href;
  const { default: viteConfig } = await import(
    /* @vite-ignore */ viteConfigUrl
  );

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.get("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(PROJECT_ROOT, "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
