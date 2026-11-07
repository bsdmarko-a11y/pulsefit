import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import {
  Play, Flame, Timer, Zap, Quote, ChevronRight, Dumbbell, TrendingUp, Plus, CalendarPlus,
} from "lucide-react";
import {
  GlassCard, Button, AnimatedCounter, ProgressRing, Badge, SectionHeading,
  EmptyState, Page, stagger, riseIn,
} from "../components/ui.jsx";
import {
  useApiData, ApiErrorState, Skeleton, SkeletonRings, SkeletonChart,
} from "../components/states.jsx";
import { api } from "../lib/api.js";
import { quoteOfTheDay } from "../data/mockData.js";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <div className="font-semibold mb-0.5">{label}</div>
      <div className="text-dim">{payload[0].value} active minutes</div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { data, error, loading, reload } = useApiData((signal) => api.dashboard(signal), []);

  if (error) {
    return (
      <Page>
        <ApiErrorState error={error} onRetry={reload} />
      </Page>
    );
  }

  if (loading || !data) {
    return (
      <Page>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <GlassCard hover={false} className="p-6 sm:p-8">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-72 mt-4" />
            <Skeleton className="h-4 w-48 mt-3" />
          </GlassCard>
          <GlassCard hover={false} className="p-6 sm:p-8">
            <Skeleton className="h-6 w-40 mb-6" />
            <SkeletonRings />
          </GlassCard>
          <GlassCard hover={false} className="p-6">
            <Skeleton className="h-6 w-40 mb-5" />
            <SkeletonChart />
          </GlassCard>
        </div>
      </Page>
    );
  }

  const { user, streak, weekly, rings, todaysWorkout, recent } = data;
  const firstName = user.fullName.split(" ")[0];
  const maxMin = Math.max(...weekly.map((d) => d.minutes), 1);
  const totalMin = weekly.reduce((s, d) => s + d.minutes, 0);

  const workoutsLeft = Math.max(0, rings.workouts.target - rings.workouts.value);
  const hasExercises = todaysWorkout && todaysWorkout.exerciseCount > 0;
  const isDone = todaysWorkout?.status === "completed";

  return (
    <Page>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* greeting */}
        <motion.div variants={riseIn}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Ready, <span className="grad-text">{firstName}</span>?
          </h1>
          <p className="text-dim text-sm mt-1.5">
            {totalMin} active minutes in the last 7 days
            {workoutsLeft > 0
              ? ` · ${workoutsLeft} more workout${workoutsLeft === 1 ? "" : "s"} to hit your weekly goal`
              : " · weekly goal reached"}
          </p>
        </motion.div>

        {/* today's workout */}
        <motion.div variants={riseIn}>
          {hasExercises ? (
            <GlassCard hover={false} className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full grad-bg opacity-20 blur-3xl" />
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <Badge tone={isDone ? "accent" : "cyan"}>
                    {isDone ? "Completed today" : todaysWorkout.status === "in_progress" ? "In progress" : "Today"}
                  </Badge>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
                    {todaysWorkout.name}
                  </h2>
                  <p className="text-dim text-sm mt-1.5">
                    {todaysWorkout.doneSets} of {todaysWorkout.totalSets} sets done
                  </p>

                  <div className="flex flex-wrap gap-5 mt-5 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Dumbbell size={16} className="text-[var(--accent)]" />
                      <strong className="font-display">{todaysWorkout.exerciseCount}</strong>
                      <span className="text-dim">exercises</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Zap size={16} className="text-amber-600 dark:text-amber-300" />
                      <strong className="font-display">{todaysWorkout.totalSets}</strong>
                      <span className="text-dim">sets</span>
                    </span>
                    {todaysWorkout.durationMinutes != null && (
                      <span className="inline-flex items-center gap-2">
                        <Timer size={16} className="text-cyan-700 dark:text-cyan-300" />
                        <strong className="font-display">{todaysWorkout.durationMinutes}</strong>
                        <span className="text-dim">min logged</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Button size="lg" icon={Play} onClick={() => onNavigate("live")}>
                    {isDone ? "Review session" : todaysWorkout.doneSets > 0 ? "Continue" : "Start"}
                  </Button>
                  <Button variant="ghost" size="lg" icon={Plus} onClick={() => onNavigate("library")}>
                    Add exercises
                  </Button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <EmptyState
              icon={CalendarPlus}
              title="No workout yet today"
              message="Pick a few exercises from the Library and they will show up here, ready to start."
              action={
                <Button icon={Plus} onClick={() => onNavigate("library")}>
                  Browse the library
                </Button>
              }
            />
          )}
        </motion.div>

        {/* rings */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6 sm:p-8">
            <SectionHeading eyebrow="This week" title="Goal progress" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 place-items-center">
              <ProgressRing
                value={rings.workouts.value} target={rings.workouts.target}
                tone="lime" label="Workouts" delay={0} size={132}
              />
              <ProgressRing
                value={rings.minutes.value} target={rings.minutes.target}
                unit="min" tone="cyan" label="Active minutes" delay={0.18} size={132}
              />
              <ProgressRing
                value={rings.goals.value} target={rings.goals.target}
                tone="violet" label="Goals hit" delay={0.36} size={132}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* chart + streak */}
        <div className="grid gap-5 lg:grid-cols-3">
          <motion.div variants={riseIn} className="lg:col-span-2">
            <GlassCard hover={false} className="p-6 h-full">
              <SectionHeading
                eyebrow="Activity"
                title="Last 7 days"
                action={
                  <Button variant="ghost" size="sm" icon={TrendingUp} onClick={() => onNavigate("progress")}>
                    Full progress
                  </Button>
                }
              />
              {totalMin === 0 ? (
                <div className="h-56 grid place-items-center text-center px-6">
                  <div>
                    <p className="text-sm font-semibold">Nothing logged in the last week</p>
                    <p className="text-dim text-xs mt-1.5 max-w-xs mx-auto">
                      Finish a workout and your active minutes will show up here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-56 -ml-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#bef264" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 6" stroke="currentColor" className="text-dim" opacity={0.15} vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} className="text-dim" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor" }} className="text-dim" width={38} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.06 }} />
                      <Bar dataKey="minutes" radius={[8, 8, 4, 4]} animationDuration={1200} animationEasing="ease-out">
                        {weekly.map((d, i) => (
                          <Cell key={i} fill="url(#barGrad)" opacity={d.minutes === maxMin && d.minutes > 0 ? 1 : 0.55} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </GlassCard>
          </motion.div>

          <motion.div variants={riseIn} className="flex flex-col gap-5">
            <GlassCard hover={false} className="relative overflow-hidden p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/12 to-transparent" />
              <div className="relative">
                <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-orange-500/15">
                  <motion.div
                    animate={{ scale: streak > 0 ? [1, 1.14, 1] : 1 }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flame size={26} className="text-orange-600 dark:text-orange-400" strokeWidth={2.3} />
                  </motion.div>
                </div>
                <div className="font-display text-5xl font-bold mt-4">
                  <AnimatedCounter value={streak} />
                </div>
                <div className="text-dim text-sm mt-1">day streak</div>
                <p className="text-[11px] text-dim mt-4">
                  {streak === 0
                    ? "Finish a workout today to start one."
                    : "Consecutive days with a completed workout."}
                </p>
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-6 flex-1">
              <Quote size={18} className="text-[var(--accent)]" />
              <p className="font-display text-base font-medium mt-3 leading-snug">“{quoteOfTheDay.text}”</p>
              <p className="text-xs text-dim mt-3">— {quoteOfTheDay.author}</p>
            </GlassCard>
          </motion.div>
        </div>

        {/* recent */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6">
            <SectionHeading eyebrow="History" title="Recent sessions" />
            {recent.length === 0 ? (
              <p className="text-dim text-sm py-6 text-center">
                No finished workouts yet. Your first one will land here.
              </p>
            ) : (
              <div className="divide-y divide-[color-mix(in_oklab,var(--text)_8%,transparent)]">
                {recent.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-4 py-3.5"
                  >
                    <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0
                                    bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
                      <Dumbbell size={17} className="text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{s.name}</div>
                      <div className="text-xs text-dim mt-0.5">
                        {new Date(s.date).toLocaleDateString(undefined, {
                          weekday: "long", day: "numeric", month: "short",
                        })}
                        {s.minutes ? ` · ${s.minutes} min` : ""}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-dim" />
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </Page>
  );
}
