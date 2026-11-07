import { getSql } from "./_lib/db.js";
import { requireUserId } from "./_lib/auth.js";
import { handler, body, badRequest, notFound } from "./_lib/http.js";

/**
 * Loads one workout with its exercises and sets, scoped to the owner.
 * Every query here filters on user_id so one account can never read another.
 */
async function loadWorkout(sql, userId, workoutId) {
  const [workout] = await sql`
    SELECT id, name, workout_date, status, duration_minutes, started_at, completed_at
    FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}
  `;
  if (!workout) return null;

  const rows = await sql`
    SELECT
      we.id            AS workout_exercise_id,
      we.order_index,
      e.id             AS exercise_id,
      e.name, e.muscle_group, e.reps, e.difficulty, e.rest_seconds, e.description,
      ws.id            AS set_id,
      ws.set_number,
      ws.completed,
      ws.completed_at
    FROM workout_exercises we
    JOIN exercises    e  ON e.id = we.exercise_id
    LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
    WHERE we.workout_id = ${workout.id}
    ORDER BY we.order_index, ws.set_number
  `;

  const byExercise = new Map();
  for (const r of rows) {
    if (!byExercise.has(r.workout_exercise_id)) {
      byExercise.set(r.workout_exercise_id, {
        workoutExerciseId: r.workout_exercise_id,
        exerciseId: r.exercise_id,
        name: r.name,
        muscleGroup: r.muscle_group,
        reps: r.reps,
        difficulty: r.difficulty,
        restSeconds: r.rest_seconds,
        description: r.description,
        orderIndex: r.order_index,
        sets: [],
      });
    }
    if (r.set_id) {
      byExercise.get(r.workout_exercise_id).sets.push({
        id: r.set_id,
        setNumber: r.set_number,
        completed: r.completed,
        completedAt: r.completed_at,
      });
    }
  }

  return {
    id: workout.id,
    name: workout.name,
    workoutDate: workout.workout_date,
    status: workout.status,
    durationMinutes: workout.duration_minutes,
    startedAt: workout.started_at,
    completedAt: workout.completed_at,
    exercises: [...byExercise.values()],
  };
}

async function todaysWorkoutId(sql, userId) {
  const [row] = await sql`
    SELECT id FROM workouts
    WHERE user_id = ${userId} AND workout_date = CURRENT_DATE
  `;
  return row?.id ?? null;
}

export default handler({
  /** GET /api/workouts -> today's workout, or null when none exists yet. */
  GET: async (req, res) => {
    const userId = await requireUserId(req);
    const sql = getSql();

    const id = req.query?.id ? Number(req.query.id) : await todaysWorkoutId(sql, userId);
    if (!id) return res.status(200).json({ workout: null });

    const workout = await loadWorkout(sql, userId, id);
    if (!workout) throw notFound("That workout does not exist.");

    return res.status(200).json({ workout });
  },

  /** POST /api/workouts { exerciseId } -> add an exercise to today's workout. */
  POST: async (req, res) => {
    const userId = await requireUserId(req);
    const { exerciseId } = body(req);

    const exId = Number(exerciseId);
    if (!exId) throw badRequest("Which exercise should I add?");

    const sql = getSql();

    const [exercise] = await sql`
      SELECT id, name, sets FROM exercises WHERE id = ${exId}
    `;
    if (!exercise) throw notFound("That exercise is not in the library.");

    // Create today's workout on first add.
    let workoutId = await todaysWorkoutId(sql, userId);
    if (!workoutId) {
      const [created] = await sql`
        INSERT INTO workouts (user_id, name, workout_date, status)
        VALUES (${userId}, ${"Today's Session"}, CURRENT_DATE, 'planned')
        ON CONFLICT (user_id, workout_date) DO UPDATE SET name = workouts.name
        RETURNING id
      `;
      workoutId = created.id;
    }

    const [{ next }] = await sql`
      SELECT COALESCE(max(order_index) + 1, 0)::int AS next
      FROM workout_exercises WHERE workout_id = ${workoutId}
    `;

    const [we] = await sql`
      INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
      VALUES (${workoutId}, ${exId}, ${next})
      ON CONFLICT (workout_id, exercise_id) DO NOTHING
      RETURNING id
    `;

    if (!we) {
      throw badRequest(`${exercise.name} is already in today's workout.`);
    }

    // One row per planned set, so ticking a set is a plain UPDATE.
    for (let n = 1; n <= exercise.sets; n++) {
      await sql`
        INSERT INTO workout_sets (workout_exercise_id, set_number)
        VALUES (${we.id}, ${n})
        ON CONFLICT (workout_exercise_id, set_number) DO NOTHING
      `;
    }

    const workout = await loadWorkout(sql, userId, workoutId);
    return res.status(201).json({ workout, added: exercise.name });
  },

  /** PATCH /api/workouts { id, action: 'start' | 'complete', durationMinutes } */
  PATCH: async (req, res) => {
    const userId = await requireUserId(req);
    const { id, action, durationMinutes } = body(req);
    const sql = getSql();

    const workoutId = Number(id) || (await todaysWorkoutId(sql, userId));
    if (!workoutId) throw notFound("There is no workout to update.");

    const [owned] = await sql`
      SELECT id FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}
    `;
    if (!owned) throw notFound("That workout does not exist.");

    if (action === "start") {
      await sql`
        UPDATE workouts
        SET status = 'in_progress', started_at = COALESCE(started_at, now())
        WHERE id = ${workoutId} AND user_id = ${userId}
      `;
    } else if (action === "complete") {
      const mins = Math.max(1, Math.round(Number(durationMinutes) || 1));
      await sql`
        UPDATE workouts
        SET status = 'completed', completed_at = now(), duration_minutes = ${mins}
        WHERE id = ${workoutId} AND user_id = ${userId}
      `;
    } else {
      throw badRequest("Unknown action. Use 'start' or 'complete'.");
    }

    const workout = await loadWorkout(sql, userId, workoutId);
    return res.status(200).json({ workout });
  },

  /** DELETE /api/workouts?exerciseId=... -> drop an exercise from today. */
  DELETE: async (req, res) => {
    const userId = await requireUserId(req);
    const sql = getSql();

    const weId = Number(req.query?.workoutExerciseId);
    if (!weId) throw badRequest("Which exercise should I remove?");

    const [row] = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.id = ${weId} AND we.workout_id = w.id AND w.user_id = ${userId}
      RETURNING we.workout_id
    `;
    if (!row) throw notFound("That exercise is not in your workout.");

    const workout = await loadWorkout(sql, userId, row.workout_id);
    return res.status(200).json({ workout });
  },
});
