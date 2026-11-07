import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import {
  Play, Flame, Timer, Zap, Quote, ChevronRight, Dumbbell, TrendingUp, CalendarDays,
} from "lucide-react";
import {
  GlassCard, Button, AnimatedCounter, ProgressRing, Badge, SectionHeading, Page, stagger, riseIn,
} from "../components/ui.jsx";
import {
  user, todaysWorkout, weeklyActivity, dashboardRings, quoteOfTheDay, recentSessions,
} from "../data/mockData.js";

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
  const maxMin = Math.max(...weeklyActivity.map((d) => d.minutes));
  const totalMin = weeklyActivity.reduce((s, d) => s + d.minutes, 0);

  return (
    <Page>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* greeting */}
        <motion.div variants={riseIn}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Ready, <span className="grad-text">{user.name.split(" ")[0]}</span>?
          </h1>
          <p className="text-dim text-sm mt-1.5">
            {totalMin} active minutes this week · {user.weeklyGoal - 4 > 0 ? `${user.weeklyGoal - 4} workout to hit your goal` : "goal reached"}
          </p>
        </motion.div>

        {/* today's workout */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full grad-bg opacity-20 blur-3xl" />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 min-w-0">
                <Badge tone="accent">Today</Badge>
                <h2 className="font-display text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
                  {todaysWorkout.title}
                </h2>
                <p className="text-dim text-sm mt-1.5">{todaysWorkout.focus}</p>

                <div className="flex flex-wrap gap-5 mt-5 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Timer size={16} className="text-cyan-700 dark:text-cyan-300" />
                    <strong className="font-display">{todaysWorkout.durationMin}</strong>
                    <span className="text-dim">min</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Zap size={16} className="text-amber-600 dark:text-amber-300" />
                    <strong className="font-display">{todaysWorkout.kcal}</strong>
                    <span className="text-dim">kcal</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Dumbbell size={16} className="text-[var(--accent)]" />
                    <strong className="font-display">{todaysWorkout.exercises.length}</strong>
                    <span className="text-dim">exercises</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Button size="lg" icon={Play} onClick={() => onNavigate("live")}>Start</Button>
                <Button variant="ghost" size="lg" onClick={() => onNavigate("library")}>Swap workout</Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* rings */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6 sm:p-8">
            <SectionHeading eyebrow="This week" title="Goal progress" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 place-items-center">
              {dashboardRings.map((r, i) => (
                <ProgressRing
                  key={r.label}
                  value={r.value}
                  target={r.target}
                  unit={r.unit}
                  tone={r.tone}
                  label={r.label}
                  delay={i * 0.18}
                  size={132}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* chart + streak */}
        <div className="grid gap-5 lg:grid-cols-3">
          <motion.div variants={riseIn} className="lg:col-span-2">
            <GlassCard hover={false} className="p-6 h-full">
              <SectionHeading
                eyebrow="Activity"
                title="Weekly minutes"
                action={
                  <Button variant="ghost" size="sm" icon={TrendingUp} onClick={() => onNavigate("progress")}>
                    Full progress
                  </Button>
                }
              />
              <div className="h-56 -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
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
                      {weeklyActivity.map((d, i) => (
                        <Cell key={i} fill="url(#barGrad)" opacity={d.minutes === maxMin ? 1 : 0.55} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={riseIn} className="flex flex-col gap-5">
            <GlassCard hover={false} className="relative overflow-hidden p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/12 to-transparent" />
              <div className="relative">
                <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-orange-500/15">
                  <motion.div
                    animate={{ scale: [1, 1.14, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flame size={26} className="text-orange-600 dark:text-orange-400" strokeWidth={2.3} />
                  </motion.div>
                </div>
                <div className="font-display text-5xl font-bold mt-4">
                  <AnimatedCounter value={user.streak} />
                </div>
                <div className="text-dim text-sm mt-1">day streak</div>
                <div className="mt-4 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.streak / user.bestStreak) * 100}%` }}
                    transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-300"
                  />
                </div>
                <p className="text-[11px] text-dim mt-2">{user.bestStreak - user.streak} days to beat your record</p>
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
            <SectionHeading
              eyebrow="History"
              title="Recent sessions"
              action={
                <Button variant="ghost" size="sm" icon={CalendarDays} onClick={() => onNavigate("classes")}>
                  Book a class
                </Button>
              }
            />
            <div className="divide-y divide-[color-mix(in_oklab,var(--text)_8%,transparent)]">
              {recentSessions.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => onNavigate("progress")}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="w-full flex items-center gap-4 py-3.5 text-left group cursor-pointer"
                >
                  <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0
                                  bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]
                                  group-hover:bg-[color-mix(in_oklab,var(--accent)_22%,transparent)] transition-colors">
                    <Dumbbell size={17} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate group-hover:text-[var(--accent)] transition-colors">{s.name}</div>
                    <div className="text-xs text-dim mt-0.5">{s.date} · {s.minutes} min · {s.kcal} kcal</div>
                  </div>
                  <ChevronRight size={16} className="text-dim group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Page>
  );
}
