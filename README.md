# PulseFit

A gym app for planning workouts, tracking progress, booking classes and keeping the streak alive.
Dark-first design with a lime→cyan accent, glassmorphism cards and motion throughout.

React + Vite on the front, Lakebase Postgres on Neon behind serverless functions in `/api`.

## First run

```bash
npm install
```

The project is linked to a Neon project (`.neon`). Pull this branch's env vars:

```bash
neon env pull
```

That writes `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) into `.env`,
alongside the `JWT_SECRET` already there. Then create the tables and sample data, and start everything:

```bash
npm run db:setup
```

```bash
npm run dev
```

Open http://localhost:5173

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite frontend **and** the `/api` functions together |
| `npm run db:setup` | Runs `db/schema.sql` then `db/seed.sql`; safe to re-run |
| `npm run build` | Production build of the frontend |

## How the API works

`npm run dev` runs two processes under `concurrently`:

- **web** — Vite on `:5173`, proxying `/api/*` to `:3001`
- **api** — `server/dev.js`, a small Express app that maps `/api/auth/login` to
  `api/auth/login.js` and calls its `export default (req, res)` handler

Those are the same files, with the same signature, that Vercel deploys as serverless
functions. Nothing about the handlers changes at deploy time, and no Vercel login is
needed locally.

**The connection string never reaches the browser.** Every query runs in `/api`;
the frontend only ever calls `fetch("/api/...")`.

### Routes

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/auth/signup` | – | Create account, set session cookie |
| `POST /api/auth/login` | – | Sign in |
| `POST /api/auth/logout` | – | Clear the cookie |
| `GET /api/auth/me` | – | Current user, or `null` |
| `GET /api/stats` | – | Landing-page counters |
| `GET /api/dashboard` | ✓ | Rings, streak, 7-day chart, today's workout, history |
| `GET /api/exercises` | ✓ | Exercise library, optional `?group=` |
| `GET /api/classes` | ✓ | This week's timetable |
| `GET /api/workouts` | ✓ | Today's workout with exercises and sets |
| `POST /api/workouts` | ✓ | Add an exercise to today |
| `PATCH /api/workouts` | ✓ | `start` or `complete` |
| `DELETE /api/workouts` | ✓ | Remove an exercise |
| `PATCH /api/sets` | ✓ | Tick or untick one set |

Every authenticated route filters on the signed-in `user_id`, so one account can
never read or write another's rows.

## Database driver

`api/_lib/db.js` uses **node-postgres** (`pg`) with a module-scoped pool, which is what the
Neon agent skill recommends for Vercel:

> On Vercel, use `node-postgres` (`npm install pg`) with Vercel Fluid compute and
> `import { attachDatabasePool } from "@vercel/functions"`.

`attachDatabasePool` is called only when `process.env.VERCEL` is set, so local dev is unaffected.
`getSql()` exposes a tagged template — `` sql`SELECT ... ${id}` `` — that binds every
interpolation as a query parameter, so no value is ever concatenated into SQL.

**Pooled vs direct.** Application queries use the pooled `DATABASE_URL`. Schema work
(`npm run db:setup`) uses `DATABASE_URL_UNPOOLED`, because DDL through PgBouncer fails in
ways that never mention pooling.

## Auth

Passwords are hashed with bcryptjs. The session is a JWT (jose, HS256) in an
httpOnly cookie — not reachable from JavaScript. Landing, login and sign-up are
public; everything else redirects to login.

## Layout

```
api/
  _lib/        db, auth and error helpers (never routable - leading underscore)
  auth/        signup, login, logout, me
  *.js         stats, dashboard, exercises, classes, workouts, sets
db/
  schema.sql   tables, foreign keys, indexes
  seed.sql     30 exercises, 10 classes this week
scripts/
  db-setup.js  runs schema then seed, prints row counts
server/
  dev.js       local stand-in for the Vercel runtime
src/
  components/  ui.jsx (design system), Shell.jsx (nav), states.jsx (skeletons, errors)
  context/     AuthContext.jsx
  lib/api.js   typed fetch wrapper
  screens/     one file per screen
```

## What is live vs. still mock

Live from Postgres: **Landing** counters, **Dashboard**, **Workout Library**,
**Live Workout**, **Classes** timetable, **Profile** identity and lifetime totals.

Still from `src/data/mockData.js`: the **Progress** screen (strength curves, body
metrics, PRs), the achievement badges on Profile, and the quote of the day. There are
no tables for those yet. Class bookings are client-side only — the `classes` table has
no bookings relation.

## Environment variables

Both are needed locally and in Vercel later:

| Name | Notes |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string (hostname has `-pooler`) |
| `JWT_SECRET` | Long random string; changing it signs everyone out |

`neon env pull` also writes `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_BRANCH_ID` and
`NEON_FUNCTION_HOST_SUFFIX`. Only the two above are needed in Vercel; the unpooled URL is
used by `npm run db:setup` locally.

`.env` is gitignored. `.env.example` shows the shape.
