import { getSql } from "./_lib/db.js";
import { requireUserId } from "./_lib/auth.js";
import { handler, body, badRequest, notFound } from "./_lib/http.js";

/**
 * PATCH /api/sets { setId, completed }
 *
 * The join through workout_exercises -> workouts is what scopes the write to
 * the signed-in user: a set id belonging to someone else matches no rows.
 */
export default handler({
  PATCH: async (req, res) => {
    const userId = await requireUserId(req);
    const { setId, completed } = body(req);

    const id = Number(setId);
    if (!id) throw badRequest("Which set should I update?");
    if (typeof completed !== "boolean") throw badRequest("`completed` must be true or false.");

    const sql = getSql();

    const [row] = await sql`
      UPDATE workout_sets ws
      SET completed = ${completed},
          completed_at = CASE WHEN ${completed} THEN now() ELSE NULL END
      FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE ws.id = ${id}
        AND we.id = ws.workout_exercise_id
        AND w.user_id = ${userId}
      RETURNING ws.id, ws.set_number, ws.completed, ws.completed_at, w.id AS workout_id
    `;

    if (!row) throw notFound("That set is not part of one of your workouts.");

    // Report remaining work so the client knows when to celebrate.
    const [progress] = await sql`
      SELECT
        count(*)::int                                        AS total,
        count(*) FILTER (WHERE ws.completed)::int            AS done
      FROM workout_sets ws
      JOIN workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.workout_id = ${row.workout_id}
    `;

    return res.status(200).json({
      set: {
        id: row.id,
        setNumber: row.set_number,
        completed: row.completed,
        completedAt: row.completed_at,
      },
      progress: { done: progress.done, total: progress.total },
    });
  },
});
