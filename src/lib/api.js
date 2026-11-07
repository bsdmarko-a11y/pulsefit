/**
 * Thin fetch wrapper. Every call goes to /api, which Vite proxies to the
 * local Express runner in dev and Vercel serves in production. The database
 * connection string never leaves the server.
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      signal,
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot reach the server. Is `npm run dev` still running?",
      0
    );
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        res.ok ? "The server sent a response I could not read." : text.slice(0, 200),
        res.status
      );
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status}).`, res.status);
  }
  return data;
}

export const api = {
  /* auth */
  me: () => request("/api/auth/me"),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
  logout: () => request("/api/auth/logout", { method: "POST" }),

  /* public */
  stats: (signal) => request("/api/stats", { signal }),

  /* app data */
  dashboard: (signal) => request("/api/dashboard", { signal }),
  exercises: (group, signal) =>
    request(
      group && group !== "All" ? `/api/exercises?group=${encodeURIComponent(group)}` : "/api/exercises",
      { signal }
    ),
  classes: (signal) => request("/api/classes", { signal }),

  /* workouts */
  todaysWorkout: (signal) => request("/api/workouts", { signal }),
  addExercise: (exerciseId) =>
    request("/api/workouts", { method: "POST", body: { exerciseId } }),
  removeExercise: (workoutExerciseId) =>
    request(`/api/workouts?workoutExerciseId=${workoutExerciseId}`, { method: "DELETE" }),
  startWorkout: (id) =>
    request("/api/workouts", { method: "PATCH", body: { id, action: "start" } }),
  completeWorkout: (id, durationMinutes) =>
    request("/api/workouts", {
      method: "PATCH",
      body: { id, action: "complete", durationMinutes },
    }),
  toggleSet: (setId, completed) =>
    request("/api/sets", { method: "PATCH", body: { setId, completed } }),
};
