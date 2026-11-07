import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Play, Pause, RotateCcw, Check, SkipForward, Timer, Flame, Trophy, Zap, X, Dumbbell,
} from "lucide-react";
import { GlassCard, Button, Badge, SectionHeading, Page, useToast } from "../components/ui.jsx";
import { todaysWorkout } from "../data/mockData.js";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function fireConfetti() {
  const base = { spread: 80, ticks: 180, gravity: 0.9, scalar: 1.05, zIndex: 200 };
  const colors = ["#bef264", "#22d3ee", "#a3e635", "#67e8f9", "#ffffff"];
  confetti({ ...base, particleCount: 90, origin: { x: 0.2, y: 0.7 }, angle: 60, colors });
  confetti({ ...base, particleCount: 90, origin: { x: 0.8, y: 0.7 }, angle: 120, colors });
  setTimeout(() => confetti({ ...base, particleCount: 140, origin: { x: 0.5, y: 0.45 }, spread: 140, colors }), 220);
}

export default function LiveWorkout({ onNavigate }) {
  const toast = useToast();

  const [done, setDone] = useState(() =>
    Object.fromEntries(todaysWorkout.exercises.map((e) => [e.id, Array(e.sets).fill(false)]))
  );
  const [rest, setRest] = useState(0);
  const [restTotal, setRestTotal] = useState(90);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);
  const celebrated = useRef(false);

  const totalSets = todaysWorkout.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = useMemo(
    () => Object.values(done).flat().filter(Boolean).length,
    [done]
  );
  const pct = doneSets / totalSets;

  /* session clock */
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* rest timer */
  useEffect(() => {
    if (!running || rest <= 0) return;
    const id = setInterval(() => {
      setRest((r) => {
        if (r <= 1) {
          setRunning(false);
          toast("Rest over — next set", { type: "info" });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, rest, toast]);

  /* completion */
  useEffect(() => {
    if (doneSets === totalSets && !celebrated.current) {
      celebrated.current = true;
      setComplete(true);
      setRunning(false);
      fireConfetti();
    }
  }, [doneSets, totalSets]);

  const toggleSet = useCallback((exId, idx, restSec) => {
    setDone((d) => {
      const next = { ...d, [exId]: d[exId].map((v, i) => (i === idx ? !v : v)) };
      if (!d[exId][idx]) {
        setRestTotal(restSec);
        setRest(restSec);
        setRunning(true);
      }
      return next;
    });
  }, []);

  const resetAll = () => {
    setDone(Object.fromEntries(todaysWorkout.exercises.map((e) => [e.id, Array(e.sets).fill(false)])));
    setRest(0);
    setRunning(false);
    setElapsed(0);
    setComplete(false);
    celebrated.current = false;
    toast("Session reset", { type: "info" });
  };

  const R = 86;
  const C = 2 * Math.PI * R;
  const restPct = restTotal ? rest / restTotal : 0;

  const volume = todaysWorkout.exercises.reduce(
    (sum, e) => sum + done[e.id].filter(Boolean).length * e.reps * e.weight,
    0
  );

  return (
    <Page>
      <SectionHeading
        eyebrow="Live"
        title={todaysWorkout.title}
        subtitle={todaysWorkout.focus}
        action={
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetAll}>
            Reset
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
                { icon: Timer, label: "Elapsed", value: fmt(elapsed), tone: "text-cyan-700 dark:text-cyan-300" },
                { icon: Dumbbell, label: "Volume", value: `${(volume / 1000).toFixed(1)}t`, tone: "text-[var(--accent)]" },
                { icon: Zap, label: "Burned", value: `${Math.round(todaysWorkout.kcal * pct)}`, tone: "text-amber-600 dark:text-amber-300" },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="rounded-xl p-3 text-center bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                  <Icon size={15} className={`mx-auto ${tone}`} />
                  <div className="font-display text-base font-bold mt-1.5 tabular-nums">{value}</div>
                  <div className="text-[10px] text-dim">{label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* exercise list */}
        <div className="lg:col-span-3 space-y-3">
          {todaysWorkout.exercises.map((ex, i) => {
            const sets = done[ex.id];
            const finished = sets.every(Boolean);
            return (
              <motion.div
                key={ex.id}
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
                        <span className="font-display text-xs font-bold text-dim">{String(i + 1).padStart(2, "0")}</span>
                        <h3 className={`font-display text-lg font-semibold truncate ${finished ? "text-[var(--accent)]" : ""}`}>
                          {ex.name}
                        </h3>
                      </div>
                      <p className="text-xs text-dim mt-1">
                        {ex.sets} × {ex.reps} @ {ex.weight} kg · {ex.rest}s rest
                      </p>
                    </div>
                    {finished && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}>
                        <Badge tone="accent"><Check size={12} /> Done</Badge>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {sets.map((on, idx) => (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleSet(ex.id, idx, ex.rest)}
                        className={`relative h-11 min-w-[70px] rounded-xl px-3 text-sm font-semibold transition-all cursor-pointer
                          ${on
                            ? "grad-bg text-[#07090d] shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--accent)_85%,transparent)]"
                            : "bg-[color-mix(in_oklab,var(--text)_7%,transparent)] text-dim hover:text-[var(--text)] border border-[color-mix(in_oklab,var(--text)_10%,transparent)]"}`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {on ? <Check size={14} strokeWidth={3} /> : null}
                          Set {idx + 1}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* completion overlay */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-5 bg-black/65 backdrop-blur-md"
            onClick={() => setComplete(false)}
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
                onClick={() => setComplete(false)}
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
                {todaysWorkout.title} — every set logged. That is {doneSets} sets in {fmt(elapsed)}.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-7">
                {[
                  { icon: Timer, v: fmt(elapsed), l: "Duration" },
                  { icon: Flame, v: todaysWorkout.kcal, l: "kcal" },
                  { icon: Dumbbell, v: `${(volume / 1000).toFixed(1)}t`, l: "Volume" },
                ].map(({ icon: Icon, v, l }) => (
                  <div key={l} className="rounded-xl p-3 bg-[color-mix(in_oklab,var(--text)_7%,transparent)]">
                    <Icon size={15} className="mx-auto text-[var(--accent)]" />
                    <div className="font-display font-bold mt-1.5 tabular-nums">{v}</div>
                    <div className="text-[10px] text-dim">{l}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-7">
                <Button className="flex-1" onClick={() => { setComplete(false); onNavigate("progress"); }}>
                  See progress
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => { setComplete(false); fireConfetti(); }}>
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
