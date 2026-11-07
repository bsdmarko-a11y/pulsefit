/**
 * Local stand-in for Vercel's serverless runtime.
 *
 * It loads the exact same files from /api that Vercel deploys, with the same
 * `export default (req, res)` contract, so nothing about the handlers has to
 * change between here and production. Vite proxies /api to this server.
 */
import "dotenv/config";
import express from "express";
import { existsSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

const PORT = Number(process.env.API_PORT) || 3001;
const API_DIR = resolve(process.cwd(), "api");

const app = express();
app.use(express.json({ limit: "1mb" }));

/* Vercel gives handlers a parsed req.cookies; Express does not. */
app.use((req, _res, next) => {
  req.cookies = {};
  const header = req.headers.cookie;
  if (header) {
    for (const part of header.split(";")) {
      const i = part.indexOf("=");
      if (i === -1) continue;
      const k = part.slice(0, i).trim();
      if (k) req.cookies[k] = decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  next();
});

/**
 * Map /api/auth/login -> api/auth/login.js, the same way Vercel does.
 * Paths are normalised and confined to API_DIR, and anything starting with
 * an underscore (our shared _lib) is never routable.
 */
function resolveRoute(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath))
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/");

  if (!clean.startsWith("api/")) return null;
  if (clean.includes("..")) return null;
  if (clean.split("/").some((s) => s.startsWith("_"))) return null;

  const rel = clean.slice("api/".length).replace(/\/+$/, "");
  if (!rel) return null;

  for (const candidate of [join(API_DIR, `${rel}.js`), join(API_DIR, rel, "index.js")]) {
    const full = resolve(candidate);
    if (full.startsWith(API_DIR) && existsSync(full)) return full;
  }
  return null;
}

app.all(/^\/api\/.*/, async (req, res) => {
  const file = resolveRoute(req.path);
  if (!file) {
    return res.status(404).json({ error: `No API route for ${req.path}` });
  }

  try {
    // Cache-busted so `node --watch` picks up handler edits on reload.
    const mod = await import(`${pathToFileURL(file).href}?v=${Date.now()}`);
    const fn = mod.default;
    if (typeof fn !== "function") {
      return res.status(500).json({ error: `${req.path} has no default export.` });
    }
    return await fn(req, res);
  } catch (error) {
    console.error(`[api] failed to run ${req.path}`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: "The API route crashed. Check the server log." });
    }
  }
});

app.listen(PORT, () => {
  const configured = Boolean(process.env.DATABASE_URL);
  console.log(`\n  API  http://localhost:${PORT}/api  (serving ./api)`);
  console.log(
    configured
      ? "  DB   DATABASE_URL loaded\n"
      : "  DB   DATABASE_URL is MISSING - add it to .env, then restart\n"
  );
});
