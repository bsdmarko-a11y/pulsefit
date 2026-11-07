import { getSql } from "../_lib/db.js";
import { verifyPassword, signToken, setAuthCookie } from "../_lib/auth.js";
import { handler, body, badRequest } from "../_lib/http.js";

export default handler({
  POST: async (req, res) => {
    const { email, password } = body(req);
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw badRequest("Enter your email and password.");
    }

    const sql = getSql();
    const [user] = await sql`
      SELECT id, email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes
      FROM users WHERE email = ${cleanEmail}
    `;

    // Same message either way, so this cannot be used to probe which
    // addresses are registered.
    const ok = user && (await verifyPassword(String(password), user.password_hash));
    if (!ok) {
      const e = new Error("bad credentials");
      e.statusCode = 401;
      e.userMessage = "That email and password do not match.";
      throw e;
    }

    setAuthCookie(res, await signToken(user.id));

    return res.status(200).json({
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
