import { getSql } from "./_lib/db.js";
import { requireUserId } from "./_lib/auth.js";
import { handler } from "./_lib/http.js";

export default handler({
  GET: async (req, res) => {
    const userId = await requireUserId(req);
    const sql = getSql();

    const [user] = await sql`
      SELECT full_name, weekly_goal_workouts, weekly_goal_minutes
      FROM users WHERE id = ${userId}
    `;

    /* Last 7 days of active minutes, zero-filled so the chart never has gaps. */
    const weekly = await sql`
      SELECT
        to_char(d.day, 'Dy')                               AS day,
        d.day                                              AS date,
        COALESCE(sum(w.duration_minutes), 0)::int          AS minutes
      FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, INTERVAL '1 day') AS d(day)
      LEFT JOIN workouts w
        ON w.workout_date = d.day
       AND w.user_id = ${userId}
       AND w.status = 'completed'
      GROUP BY d.day
      ORDER BY d.day
    `;

    /* Streak: walk back from today over days that have a completed workout.
       Today not being done yet does not break a streak that ran to yesterday. */
    const completedDays = await sql`
      SELECT DISTINCT workout_date
      FROM workouts
      WHERE user_id = ${userId} AND status = 'completed'
      ORDER BY workout_date DESC
      LIMIT 400
    `;

    let streak = 0;
    if (completedDays.length) {
      const asKey = (d) => new Date(d).toISOString().slice(0, 10);
      const days = new Set(completedDays.map((r) => asKey(r.workout_date)));

      const cursor = new Date();
      cursor.setUTCHours(0, 0, 0, 0);
      if (!days.has(asKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

      while (days.has(asKey(cursor))) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
    }

    /* This week, Monday-based, matching the goal period. */
    const [week] = await sql`
      SELECT
        count(*)::int                             AS workouts,
        COALESCE(sum(duration_minutes), 0)::int   AS minutes
      FROM workouts
      WHERE user_id = ${userId}
        AND status = 'completed'
        AND workout_date >= date_trunc('week', CURRENT_DATE)::date
        AND workout_date <  date_trunc('week', CURRENT_DATE)::date + 7
    `;

    const [lifetime] = await sql`
      SELECT
        count(*)::int                             AS workouts,
        COALESCE(sum(duration_minutes), 0)::int   AS minutes
      FROM workouts
      WHERE user_id = ${userId} AND status = 'completed'
    `;

    /* Today's workout, with set progress for the "Start" card. */
    const [today] = await sql`
      SELECT
        w.id, w.name, w.status, w.duration_minutes,
        count(ws.id)::int                              AS total_sets,
        count(ws.id) FILTER (WHERE ws.completed)::int  AS done_sets,
        count(DISTINCT we.id)::int                     AS exercise_count,
        COALESCE(sum(e.rest_seconds), 0)::int          AS rest_seconds
      FROM workouts w
      LEFT JOIN workout_exercises we ON we.workout_id = w.id
      LEFT JOIN exercises e          ON e.id = we.exercise_id
      LEFT JOIN workout_sets ws      ON ws.workout_exercise_id = we.id
      WHERE w.user_id = ${userId} AND w.workout_date = CURRENT_DATE
      GROUP BY w.id
    `;

    const recent = await sql`
      SELECT id, name, workout_date, duration_minutes
      FROM workouts
      WHERE user_id = ${userId} AND status = 'completed'
      ORDER BY workout_date DESC, completed_at DESC NULLS LAST
      LIMIT 5
    `;

    const goalWorkouts = user?.weekly_goal_workouts ?? 5;
    const goalMinutes = user?.weekly_goal_minutes ?? 400;

    /* "Goals hit" = how many of the two weekly targets are met, plus a
       streak bonus, expressed out of 3 so the third ring has a scale. */
    const goalsHit =
      (week.workouts >= goalWorkouts ? 1 : 0) +
      (week.minutes >= goalMinutes ? 1 : 0) +
      (streak >= 3 ? 1 : 0);

    return res.status(200).json({
      user: {
        fullName: user?.full_name ?? "Athlete",
        weeklyGoalWorkouts: goalWorkouts,
        weeklyGoalMinutes: goalMinutes,
      },
      streak,
      weekly: weekly.map((r) => ({ day: r.day.trim(), date: r.date, minutes: r.minutes })),
      rings: {
        workouts: { value: week.workouts, target: goalWorkouts },
        minutes: { value: week.minutes, target: goalMinutes },
        goals: { value: goalsHit, target: 3 },
      },
      lifetime: { workouts: lifetime.workouts, minutes: lifetime.minutes },
      todaysWorkout: today
        ? {
            id: today.id,
            name: today.name,
            status: today.status,
            durationMinutes: today.duration_minutes,
            exerciseCount: today.exercise_count,
            totalSets: today.total_sets,
            doneSets: today.done_sets,
            restSeconds: today.rest_seconds,
          }
        : null,
      recent: recent.map((r) => ({
        id: r.id,
        name: r.name,
        date: r.workout_date,
        minutes: r.duration_minutes,
      })),
    });
  },
});
