import pg from "pg";

/**
 * node-postgres, per the Neon agent skill's guidance for Vercel:
 *   "On Vercel, use node-postgres (npm install pg) with Vercel Fluid compute
 *    and import { attachDatabasePool } from '@vercel/functions'."
 *
 * The pool is module-scoped so Fluid compute (and our long-running local dev
 * server) reuse connections across requests instead of reconnecting per call.
 *
 * `getSql()` returns a tagged-template function with the same shape the rest
 * of the code already uses: sql`SELECT ... ${value}` returns an array of rows,
 * with every interpolation sent as a bound parameter, never string-concatenated.
 */

let _pool = null;

function getPool() {
  if (_pool) return _pool;

  const url = process.env.DATABASE_URL;
  if (!url) {
    const err = new Error(
      "DATABASE_URL is not set. Run `neon env pull`, or copy the pooled connection string into .env"
    );
    err.statusCode = 503;
    err.userMessage =
      "The database is not configured yet. Add DATABASE_URL to your .env file and restart the server.";
    throw err;
  }

  _pool = new pg.Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  // A pooled client that errors while idle must not take the process down.
  _pool.on("error", (err) => console.error("[db] idle client error", err.message));

  // On Vercel Fluid compute this lets the platform drain the pool between
  // invocations. It is a no-op anywhere else, so it stays behind the flag.
  if (process.env.VERCEL) {
    import("@vercel/functions")
      .then(({ attachDatabasePool }) => attachDatabasePool(_pool))
      .catch(() => {
        /* not running on Vercel after all - nothing to attach */
      });
  }

  return _pool;
}

export function getSql() {
  const pool = getPool();

  /** sql`SELECT * FROM t WHERE id = ${id}` -> rows */
  const tag = async (strings, ...values) => {
    let text = "";
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) text += `$${i + 1}`;
    }
    const { rows } = await pool.query(text, values);
    return rows;
  };

  /** Escape hatch for whole statements, used by scripts/db-setup.js. */
  tag.query = async (text, params) => (await pool.query(text, params)).rows;

  return tag;
}

/** Close the pool. Used by one-shot scripts so node can exit. */
export async function closePool() {
  if (_pool) {
    const p = _pool;
    _pool = null;
    await p.end();
  }
}

/** Turn a driver-level failure into something worth showing a person. */
export function dbError(error) {
  const msg = String(error?.message || error);

  if (error?.statusCode) return error;

  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timeout|getaddrinfo|network/i.test(msg)) {
    const e = new Error(msg);
    e.statusCode = 503;
    e.userMessage =
      "Cannot reach the database right now. Check your connection and that the Neon compute is awake.";
    return e;
  }

  if (/password authentication failed|role .* does not exist/i.test(msg)) {
    const e = new Error(msg);
    e.statusCode = 503;
    e.userMessage =
      "The database rejected those credentials. Re-run `neon env pull` to refresh DATABASE_URL.";
    return e;
  }

  if (/relation .* does not exist/i.test(msg)) {
    const e = new Error(msg);
    e.statusCode = 503;
    e.userMessage =
      "The database tables are missing. Run `npm run db:setup` to create them.";
    return e;
  }

  const e = new Error(msg);
  e.statusCode = 500;
  e.userMessage = "Something went wrong talking to the database.";
  return e;
}
