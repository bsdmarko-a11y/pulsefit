import { getSql } from "./_lib/db.js";
import { requireUserId } from "./_lib/auth.js";
import { handler } from "./_lib/http.js";

/** Classes for the current week. Booking itself is not persisted yet. */
export default handler({
  GET: async (req, res) => {
    await requireUserId(req);

    const sql = getSql();
    const rows = await sql`
      SELECT id, title, coach_name, start_time, duration_minutes, capacity, intensity
      FROM classes
      WHERE start_time >= date_trunc('week', now())
        AND start_time <  date_trunc('week', now()) + INTERVAL '7 days'
      ORDER BY start_time
    `;

    return res.status(200).json({
      classes: rows.map((r) => ({
        id: r.id,
        title: r.title,
        coachName: r.coach_name,
        startTime: r.start_time,
        durationMinutes: r.duration_minutes,
        capacity: r.capacity,
        intensity: r.intensity,
      })),
    });
  },
});
