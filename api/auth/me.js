import { getSql } from "../_lib/db.js";
import { getUserId } from "../_lib/auth.js";
import { handler } from "../_lib/http.js";

export default handler({
  GET: async (req, res) => {
    const uid = await getUserId(req);
    if (!uid) return res.status(200).json({ user: null });

    const sql = getSql();
    const [user] = await sql`
      SELECT id, email, full_name, weekly_goal_workouts, weekly_goal_minutes, created_at
      FROM users WHERE id = ${uid}
    `;
    if (!user) return res.status(200).json({ user: null });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        weeklyGoalWorkouts: user.weekly_goal_workouts,
        weeklyGoalMinutes: user.weekly_goal_minutes,
        createdAt: user.created_at,
      },
    });
  },
});
