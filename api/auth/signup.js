import { getSql } from "../_lib/db.js";
import { hashPassword, signToken, setAuthCookie } from "../_lib/auth.js";
import { handler, body, badRequest } from "../_lib/http.js";

export default handler({
  POST: async (req, res) => {
    const { email, password, fullName, weeklyGoalWorkouts, weeklyGoalMinutes } = body(req);

    const cleanEmail = String(email || "").trim().toLowerCase();
    const name = String(fullName || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw badRequest("Please enter a valid email address.");
    }
    if (!password || String(password).length < 8) {
      throw badRequest("Password needs to be at least 8 characters.");
    }
    if (!name) {
      throw badRequest("Please tell us your name.");
    }

    const goalWorkouts = Math.min(14, Math.max(1, Number(weeklyGoalWorkouts) || 5));
    const goalMinutes = Math.min(2000, Math.max(30, Number(weeklyGoalMinutes) || 400));

    const sql = getSql();

    const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail}`;
    if (existing.length) {
      throw badRequest("That email is already registered. Try signing in instead.");
    }

    const passwordHash = await hashPassword(String(password));

    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
      VALUES (${cleanEmail}, ${passwordHash}, ${name}, ${goalWorkouts}, ${goalMinutes})
      RETURNING id, email, full_name, weekly_goal_workouts, weekly_goal_minutes
    `;

    setAuthCookie(res, await signToken(user.id));

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        weeklyGoalWorkouts: user.weekly_goal_workouts,
        weeklyGoalMinutes: user.weekly_goal_minutes,
      },
    });
  },
});
