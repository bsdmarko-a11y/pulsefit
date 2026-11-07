import { dbError } from "./db.js";

/**
 * Wraps a handler so every route reports failures the same way and the
 * frontend always has a human-readable `error` string to show in a toast.
 */
export function handler(methods) {
  return async (req, res) => {
    const fn = methods[req.method];
    if (!fn) {
      res.setHeader("Allow", Object.keys(methods).join(", "));
      return res.status(405).json({ error: `${req.method} not allowed here.` });
    }

    try {
      return await fn(req, res);
    } catch (error) {
      const e = dbError(error);
      if (!e.statusCode || e.statusCode >= 500) {
        console.error(`[api] ${req.method} ${req.url}`, error);
      }
      return res
        .status(e.statusCode || 500)
        .json({ error: e.userMessage || "Unexpected server error." });
    }
  };
}

/** Body parsing that behaves the same on Vercel and the local Express server. */
export function body(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function badRequest(message) {
  const e = new Error(message);
  e.statusCode = 400;
  e.userMessage = message;
  return e;
}

export function notFound(message) {
  const e = new Error(message);
  e.statusCode = 404;
  e.userMessage = message;
  return e;
}
