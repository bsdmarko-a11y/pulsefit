import { getSql } from "./_lib/db.js";
import { requireUserId } from "./_lib/auth.js";
import { handler } from "./_lib/http.js";

const GROUPS = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

export default handler({
  GET: async (req, res) => {
    await requireUserId(req);

    const group = req.query?.group;
    const sql = getSql();

    const rows =
      group && GROUPS.includes(group)
        ? await sql`
            SELECT id, name, muscle_group, sets, reps, difficulty, rest_seconds, description
            FROM exercises WHERE muscle_group = ${group} ORDER BY id
          `
        : await sql`
            SELECT id, name, muscle_group, sets, reps, difficulty, rest_seconds, description
            FROM exercises ORDER BY id
          `;

    return res.status(200).json({
      exercises: rows.map((r) => ({
        id: r.id,
        name: r.name,
        muscleGroup: r.muscle_group,
        sets: r.sets,
        reps: r.reps,
        difficulty: r.difficulty,
        restSeconds: r.rest_seconds,
        description: r.description,
      })),
    });
  },
});
