/**
 * Runs db/schema.sql then db/seed.sql against DATABASE_URL.
 * Both files are written to be safe to run repeatedly.
 */
import "dotenv/config";
import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Schema work uses the DIRECT (unpooled) connection. The Neon skill is
// explicit: DDL over the PgBouncer pooler fails in ways that never mention
// pooling - a SET that does not persist, a stray read-only transaction.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const usingPooled = !process.env.DATABASE_URL_UNPOOLED && !!process.env.DATABASE_URL;

if (!url) {
  console.error(`
  DATABASE_URL is not set.

  If this project is linked to Neon, the quickest fix is:

      neon env pull

  Otherwise, where to copy it from:
    1. Open  https://console.neon.tech  and sign in (free tier is fine).
    2. Create a project, or open the one you already have.
    3. On the Project Dashboard, find the "Connection string" box
       (top right, under "Connect to your database").
    4. Pick branch "main", database "neondb", role "neondb_owner",
       and make sure "Pooled connection" is ticked.
    5. Click the copy icon. The string looks like:

       postgresql://neondb_owner:PASSWORD@ep-something-pooler.REGION.aws.neon.tech/neondb?sslmode=require

    6. Paste it into .env in this project:

       DATABASE_URL="postgresql://..."

  Then run  npm run db:setup  again.
`);
  process.exit(1);
}

/**
 * Split on semicolons that end a statement, ignoring ones inside quotes,
 * dollar-quoted blocks and comments.
 */
function splitStatements(sqlText) {
  const out = [];
  let buf = "";
  let inSingle = false;
  let inLineComment = false;
  let dollarTag = null;

  for (let i = 0; i < sqlText.length; i++) {
    const ch = sqlText[i];
    const next = sqlText[i + 1];

    if (inLineComment) {
      buf += ch;
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (!inSingle && !dollarTag && ch === "-" && next === "-") {
      inLineComment = true;
      buf += ch;
      continue;
    }
    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      buf += ch;
      continue;
    }
    if (!inSingle && ch === "$") {
      const m = /^\$[A-Za-z_]*\$/.exec(sqlText.slice(i));
      if (m) {
        if (dollarTag === null) dollarTag = m[0];
        else if (dollarTag === m[0]) dollarTag = null;
        buf += m[0];
        i += m[0].length - 1;
        continue;
      }
    }
    if (ch === ";" && !inSingle && !dollarTag) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter((s) => s.replace(/--[^\n]*/g, "").trim().length > 0);
}

async function runFile(client, name) {
  const path = resolve(process.cwd(), "db", name);
  const statements = splitStatements(readFileSync(path, "utf8"));

  process.stdout.write(`  ${name.padEnd(12)} `);
  for (const statement of statements) {
    try {
      await client.query(statement);
    } catch (error) {
      console.error(`\n\n  Failed on statement:\n\n${statement}\n\n  ${error.message}\n`);
      throw error;
    }
  }
  console.log(`${statements.length} statements OK`);
}
const client = new pg.Client({ connectionString: url });

try {
  const host = new URL(url).host;
  console.log(`\n  Connecting to ${host}`);
  if (usingPooled) {
    console.log("  Note: using the pooled URL - DATABASE_URL_UNPOOLED was not set.");
  }
  console.log("");

  await client.connect();

  await runFile(client, "schema.sql");
  await runFile(client, "seed.sql");

  const { rows } = await client.query(`
    SELECT
      (SELECT count(*) FROM exercises)::int AS exercises,
      (SELECT count(*) FROM classes)::int   AS classes,
      (SELECT count(*) FROM users)::int     AS users,
      (SELECT count(*) FROM workouts)::int  AS workouts
  `);
  const c = rows[0];

  console.log(`
  Row counts
  ----------
  exercises   ${c.exercises}
  classes     ${c.classes}
  users       ${c.users}
  workouts    ${c.workouts}

  Database ready.
`);
} catch (error) {
  console.error(`\n  Database setup failed: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
