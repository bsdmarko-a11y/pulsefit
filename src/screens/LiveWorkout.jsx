import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Play, Pause, RotateCcw, Check, SkipForward, Timer, Flame, Trophy, X,
  Dumbbell, CalendarPlus, Plus, Loader2, Trash2,
} from "lucide-react";
import {
  GlassCard, Button, Badge, SectionHeading, EmptyState, Page, useToast,
} from "../components/ui.jsx";
import { useApiData, ApiErrorState, Skeleton } from "../components/states.jsx";
import { api } from "../lib/api.js";

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

function fireConfetti() {
  const base = { spread: 80, ticks: 180, gravity: 0.9, scalar: 1.05, zIndex: 200 };
  const colors = ["#bef264", "#22d3ee", "#a3e635", "#67e8f9", "#ffffff"];
  confetti({ ...base, particleCount: 90, origin: { x: 0.2, y: 0.7 }, angle: 60, colors });
  confetti({ ...base, particleCount: 90, origin: { x: 0.8, y: 0.7 }, angle: 120, colors });
  setTimeout(() => confetti({ ...base, particleCount: 140, origin: { x: 0.5, y: 0.45 }, spread: 140, colors }), 220);
}

export default function LiveWorkout({ onNavigate }) {
  const toast = useToast();
  const { data, error, loading, reload, setData } = useApiData(
    (signal) => api.todaysWorkout(signal),
    []
  );
  const workout = data?.workout ?? null;

  const [rest, setRest] = useState(0);
  const [restTotal, setRestTotal] = useState(90);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [pending, setPending] = useState(() => new Set());
  const celebrated = useRef(false);

  const totalSets = useMemo(
    () => workout?.exercises.reduce((s, e) => s + e.sets.length, 0) ?? 0,
    [workout]
  );
  const doneSets = useMemo(
    () => workout?.exercises.reduce((s, e) => s + e.sets.filter((x) => x.completed).length, 0) ?? 0,
    [workout]
  );
  const pct = totalSets ? doneSets / totalSets : 0;

  /* Session clock starts from whatever the server recorded, so a refresh
     mid-workout does not reset the elapsed time. */
  useEffect(() => {
    if (!workout?.startedAt || workout.status === "completed") return;
    const startedMs = new Date(workout.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.round((Date.now() - startedMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [workout?.startedAt, workout?.status]);

  /* Rest countdown */
  useEffect(() => {
    if (!running || rest <= 0) return;
    const id = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          setRunning(false);
          toast("Rest over - next set", { type: "info" });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, rest, toast]);

  /** Optimistic: flip the set immediately, roll back if the save fails. */
  const toggleSet = useCallback(
    async (exercise, set) => {
      if (pending.has(set.id) || workout?.status === "completed") return;
      const next = !set.completed;

      setData((d) => ({
        ...d,
        workout: {
          ...d.workout,
          exercises: d.workout.exercises.map((ex) =>
            ex.workoutExerciseId !== exercise.workoutExerciseId
              ? ex
              : { ...ex, sets: ex.sets.map((s) => (s.id === set.id ? { ...s, completed: next } : s)) }
          ),
        },
      }));

      if (next) {
        setRestTotal(exercise.restSeconds);
        setRest(exercise.restSeconds);
        setRunning(exercise.restSeconds > 0);
      }

      setPending((p) => new Set(p).add(set.id));

      try {
        if (workout.status === "planned") {
          await api.startWorkout(workout.id);
          setData((d) => ({ ...d, workout: { ...d.workout, status: "in_progress" } }));
        }
        await api.toggleSet(set.id, next);
      } catch (err) {
        // Roll back the optimistic flip.
        setData((d) => ({
          ...d,
          workout: {
            ...d.workout,
            exercises: d.workout.exercises.map((ex) =>
              ex.workoutExerciseId !== exercise.workoutExerciseId
                ? ex
                : { ...ex, sets: ex.sets.map((s) => (s.id === set.id ? { ...s, completed: !next } : s)) }
            ),
          },
        }));
        toast("Could not save that set", { type: "error", desc: err.message });
      } finally {
        setPending((p) => {
          const n = new Set(p);
          n.delete(set.id);
          return n;
        });
      }
    },
    [workout, pending, setData, toast]
  );

  /* Finish: persist duration + completed status, then celebrate. */
  useEffect(() => {
    if (!workout || totalSets === 0) return;
    if (doneSets !== totalSets) return;
    if (workout.status === "completed" || celebrated.current || finishing) return;

    celebrated.current = true;
    setFinishing(true);
    setRunning(false);

    const minutes = Math.max(1, Math.round(elapsed / 60));
    api
      .completeWorkout(workout.id, minutes)
      .then(({ workout: saved }) => {
        setData((d) => ({ ...d, workout: saved }));
        setCelebrate(true);
        fireConfetti();
      })
      .catch((err) => {
        celebrated.current = false;
        toast("Could not save the finish", { type: "error", desc: err.message });
      })
      .finally(() => setFinishing(false));
  }, [doneSets, totalSets, workout, elapsed, finishing, setData, toast]);

  const removeExercise = async (ex) => {
    try {
      const { workout: updated } = await api.removeExercise(ex.workoutExerciseId);
      setData((d) => ({ ...d, workout: updated }));
      celebrated.current = false;
      toast(`${ex.name} removed`, { type: "info" });
    } catch (err) {
      toast("Could not remove that", { type: "error", desc: err.message });
    }
  };

  /* ------------------------------------------------------------ rendering */

  if (error) {
    return (
      <Page>
        <ApiErrorState error={error} onRetry={reload} />
      </Page>
    );
  }

  if (loading) {
    return (
      <Page>
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-5">
            <GlassCard hover={false} className="p-7 grid place-items-center">
              <Skeleton className="h-[200px] w-[200px]" rounded="rounded-full" />
            </GlassCard>
            <GlassCard hover={false} className="p-5">
              <Skeleton className="h-4 w-full" />
            </GlassCard>
          </div>
          <div className="lg:col-span-3 space-y-3">
            {[0, 1, 2].map((i) => (
              <GlassCard key={i} hover={false} className="p-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-11 w-full mt-4" />
              </GlassCard>
            ))}
          </div>
        </div>
      </Page>
    );
  }

  if (!workout || workout.exercises.length === 0) {
    return (
      <Page>
        <SectionHeading eyebrow="Live" title="Live workout" />
        <EmptyState
          icon={CalendarPlus}
          title="No workout yet today"
          message="Pick exercises from the Library and they will appear here with their sets and rest timers ready."
          action={
            <Button icon={Plus} onClick={() => onNavigate("library")}>
              Pick from the Library
            </Button>
          }
        />
      </Page>
    );
  }

  const R = 86;
  const C = 2 * Math.PI * R;
  const restPct = restTotal ? rest / restTotal : 0;
  const isComplete = workout.status === "completed";

  return (
    <Page>
      <SectionHeading
        eyebrow="Live"
        title={workout.name}
        subtitle={`${workout.exercises.length} exercises · ${totalSets} sets`}
        action={
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reload}>
            Refresh
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* timer column */}
        <div className="lg:col-span-2 space-y-5">
          <GlassCard hover={false} className="relative overflow-hidden p-7 text-center">
            <div className="absolute inset-0 grad-bg opacity-[0.07]" />
            <div className="relative">
              <Badge tone={rest > 0 ? "cyan" : "neutral"}>
                <Timer size={12} /> {rest > 0 ? "Resting" : "Ready"}
              </Badge>

              <div className="relative mx-auto mt-5" style={{ width: 200, height: 200 }}>
                <svg width="200" height="200" className="-rotate-90 overflow-visible">
                  <defs>
                    <linearGradient id="restGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0" stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#bef264" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r={R} fill="none" strokeWidth="12" className="ring-track" />
                  <circle
                    cx="100" cy="100" r={R} fill="none"
                    stroke="url(#restGrad)" strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - restPct)}
                    style={{
                      transition: "stroke-dashoffset 1s linear",
                      filter: "drop-shadow(0 0 14px rgba(190,242,100,0.45))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <div className="font-display text-5xl font-bold tabular-nums leading-none">{fmt(rest)}</div>
                    <div className="text-xs text-dim mt-2">rest timer</div>
                  </div>
                </div>
                {running && rest > 0 && (
                  <span className="absolute inset-0 rounded-full border-2 border-[var(--accent)] animate-pulse-ring pointer-events-none" />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant={running ? "soft" : "primary"}
                  icon={running ? Pause : Play}
                  onClick={() => {
                    if (rest === 0) { setRest(restTotal); setRunning(true); }
                    else setRunning((r) => !r);
                  }}
                >
                  {running ? "Pause" : rest === 0 ? "Start rest" : "Resume"}
                </Button>
                <Button variant="ghost" icon={SkipForward} onClick={() => { setRest(0); setRunning(false); }}>
                  Skip
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {[60, 75, 90, 120].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setRestTotal(s); setRest(s); setRunning(true); }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer
                      ${restTotal === s
                        ? "grad-bg text-[#07090d]"
                        : "bg-[color-mix(in_oklab,var(--text)_8%,transparent)] text-dim hover:text-[var(--text)]"}`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard hover={false} className="p-5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-semibold">Session progress</span>
              <span className="text-dim tabular-nums">{doneSets}/{totalSets} sets</span>
            </div>
            <div className="h-2.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
              <motion.div
                className="h-full grad-bg"
                animate={{ width: `${pct * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 26 }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                {
                  icon: Timer,
                  label: isComplete ? "Logged" : "Elapsed",
                  value: isComplete ? `${workout.durationMinutes}m` : fmt(elapsed),
                  tone: "text-cyan-700 dark:text-cyan-300",
                },
                { icon: Dumbbell, label: "Exercises", value: workout.exercises.length, tone: "text-[var(--accent-text)]" },
                { icon: Check, label: "Sets done", value: doneSets, tone: "text-amber-600 dark:text-amber-300" },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="rounded-xl p-3 text-center bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                  <Icon size={15} className={`mx-auto ${tone}`} />
                  <div className="font-display text-base font-bold mt-1.5 tabular-nums">{value}</div>
                  <div className="text-[10px] text-dim">{label}</div>
                </div>
              ))}
            </div>

            {isComplete && (
              <div className="mt-4 rounded-xl px-3.5 py-2.5 text-xs text-center
                              bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]
                              border border-[color-mix(in_oklab,var(--accent)_30%,transparent)]">
                Session saved. Come back tomorrow for the next one.
              </div>
            )}
          </GlassCard>
        </div>

        {/* exercise list */}
        <div className="lg:col-span-3 space-y-3">
          {workout.exercises.map((ex, i) => {
            const finished = ex.sets.length > 0 && ex.sets.every((s) => s.completed);
            return (
              <motion.div
                key={ex.workoutExerciseId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
              >
                <GlassCard
                  hover={false}
                  className={`p-5 transition-colors ${finished ? "border-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-dim">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className={`font-display text-lg font-semibold truncate ${finished ? "text-[var(--accent-text)]" : ""}`}>
                          {ex.name}
                        </h3>
                      </div>
                      <p className="text-xs text-dim mt-1">
                        {ex.sets.length} × {ex.reps} · {ex.restSeconds}s rest · {ex.muscleGroup}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {finished && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                          <Badge tone="accent"><Check size={12} /> Done</Badge>
                        </motion.div>
                      )}
                      {!isComplete && (
                        <button
                          onClick={() => removeExercise(ex)}
                          aria-label={`Remove ${ex.name}`}
                          className="grid place-items-center h-8 w-8 rounded-lg text-dim transition-colors cursor-pointer
                                     hover:text-rose-600 dark:hover:text-rose-300
                                     bg-[color-mix(in_oklab,var(--text)_6%,transparent)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {ex.sets.map((set, idx) => {
                      const busy = pending.has(set.id);
                      return (
                        <motion.button
                          key={set.id}
                          whileTap={{ scale: 0.9 }}
                          disabled={isComplete}
                          onClick={() => toggleSet(ex, set)}
                          className={`relative h-11 min-w-[70px] rounded-xl px-3 text-sm font-semibold transition-all cursor-pointer
                            disabled:cursor-default
                            ${set.completed
                              ? "grad-bg text-[#07090d] shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--accent)_85%,transparent)]"
                              : "bg-[color-mix(in_oklab,var(--text)_7%,transparent)] text-dim hover:text-[var(--text)] border border-[color-mix(in_oklab,var(--text)_10%,transparent)]"}
                            ${busy ? "opacity-70" : ""}`}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            {busy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : set.completed ? (
                              <Check size={14} strokeWidth={3} />
                            ) : null}
                            Set {idx + 1}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}

          <div className="pt-2">
            <Button variant="ghost" className="w-full" icon={Plus} onClick={() => onNavigate("library")}>
              Add another exercise
            </Button>
          </div>
        </div>
      </div>

      {/* completion overlay */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-5 bg-black/65 backdrop-blur-md"
            onClick={() => setCelebrate(false)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md text-center relative"
            >
              <button
                onClick={() => setCelebrate(false)}
                className="absolute top-4 right-4 text-dim hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <motion.div
                animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="mx-auto grid place-items-center h-20 w-20 rounded-3xl grad-bg"
              >
                <Trophy size={36} className="text-[#07090d]" strokeWidth={2.3} />
              </motion.div>

              <h2 className="font-display text-3xl font-bold mt-6">Workout complete</h2>
              <p className="text-dim text-sm mt-2">
                {workout.name} — all {totalSets} sets logged and saved.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-7">
                {[
                  { icon: Timer, v: `${workout.durationMinutes ?? Math.max(1, Math.round(elapsed / 60))}m`, l: "Duration" },
                  { icon: Check, v: totalSets, l: "Sets" },
                  { icon: Flame, v: workout.exercises.length, l: "Exercises" },
                ].map(({ icon: Icon, v, l }) => (
                  <div key={l} className="rounded-xl p-3 bg-[color-mix(in_oklab,var(--text)_7%,transparent)]">
                    <Icon size={15} className="mx-auto text-[var(--accent-text)]" />
                    <div className="font-display font-bold mt-1.5 tabular-nums">{v}</div>
                    <div className="text-[10px] text-dim">{l}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-7">
                <Button className="flex-1" onClick={() => { setCelebrate(false); onNavigate("dashboard"); }}>
                  See dashboard
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => { setCelebrate(false); fireConfetti(); }}>
                  Again!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
