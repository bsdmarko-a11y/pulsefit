import { clearAuthCookie } from "../_lib/auth.js";
import { handler } from "../_lib/http.js";

export default handler({
  POST: async (_req, res) => {
    clearAuthCookie(res);
    return res.status(200).json({ ok: true });
  },
});
