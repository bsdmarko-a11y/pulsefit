import { getSql } from "./_lib/db.js";
import { handler } from "./_lib/http.js";

/** Public. Powers the animated counters on the landing page. */
export default handler({
  GET: async (_req, res) => {
    const sql = getSql();

    const [[members], [workouts], [classesThisWeek]] = await Promise.all([
      sql`SELECT count(*)::int AS n FROM users`,
      sql`SELECT count(*)::int AS n FROM workouts WHERE status = 'completed'`,
      sql`
        SELECT count(*)::int AS n FROM classes
        WHERE start_time >= date_trunc('week', now())
          AND start_time <  date_trunc('week', now()) + INTERVAL '7 days'
      `,
    ]);

    return res.status(200).json({
      members: members.n,
      workoutsCompleted: workouts.n,
      classesThisWeek: classesThisWeek.n,
    });
  },
});
