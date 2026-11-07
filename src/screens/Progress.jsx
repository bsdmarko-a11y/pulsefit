import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Trophy, TrendingUp, TrendingDown, Medal, Award, Scale } from "lucide-react";
import {
  GlassCard, Badge, SectionHeading, AnimatedCounter, Page, stagger, riseIn,
} from "../components/ui.jsx";
import { strengthProgress, bodyMetrics, personalRecords, user } from "../data/mockData.js";

const TIER = {
  gold: { ring: "from-amber-300 to-yellow-500", text: "text-amber-600 dark:text-amber-300", icon: Trophy },
  silver: { ring: "from-slate-200 to-slate-400", text: "text-slate-300", icon: Medal },
  bronze: { ring: "from-orange-300 to-orange-600", text: "text-orange-300", icon: Award },
};

function Tip({ active, payload, label, unit = "kg" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs space-y-0.5">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize text-dim">{p.dataKey}</span>
          <span className="font-semibold ml-auto">{p.value} {unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function Progress() {
  const [metric, setMetric] = useState("weight");

  const first = strengthProgress[0];
  const last = strengthProgress[strengthProgress.length - 1];
  const gains = [
    { lift: "Bench", from: first.bench, to: last.bench, color: "#bef264" },
    { lift: "Squat", from: first.squat, to: last.squat, color: "#22d3ee" },
    { lift: "Deadlift", from: first.deadlift, to: last.deadlift, color: "#a78bfa" },
  ];

  return (
    <Page>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={riseIn}>
          <SectionHeading
            eyebrow="Progress"
            title="Six months of work"
            subtitle="Strength curves, body composition and every personal record you have set."
          />
        </motion.div>

        {/* gain summary */}
        <motion.div variants={riseIn} className="grid gap-4 sm:grid-cols-3">
          {gains.map((g, i) => {
            const diff = g.to - g.from;
            const pct = ((diff / g.from) * 100).toFixed(1);
            return (
              <GlassCard key={g.lift} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dim">{g.lift}</span>
                  <Badge tone="accent"><TrendingUp size={11} /> +{pct}%</Badge>
                </div>
                <div className="font-display text-3xl font-bold mt-3" style={{ color: g.color }}>
                  <AnimatedCounter value={g.to} suffix=" kg" />
                </div>
                <div className="text-xs text-dim mt-1">up {diff} kg from {g.from} kg in May</div>
                <div className="mt-3 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.from / g.to) * 100}%` }}
                    transition={{ duration: 1.2, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: g.color }}
                  />
                </div>
              </GlassCard>
            );
          })}
        </motion.div>

        {/* strength chart */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6">
            <SectionHeading eyebrow="Strength" title="One-rep max over time" />
            <div className="h-72 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strengthProgress} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="currentColor" className="text-dim" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} className="text-dim" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor" }} className="text-dim" width={42} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
                  {[
                    { k: "bench", c: "#bef264" },
                    { k: "squat", c: "#22d3ee" },
                    { k: "deadlift", c: "#a78bfa" },
                  ].map(({ k, c }, i) => (
                    <Line
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stroke={c}
                      strokeWidth={2.75}
                      dot={{ r: 3.5, fill: c, strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--bg)" }}
                      animationDuration={1500}
                      animationBegin={i * 220}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* body metrics */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6">
            <SectionHeading
              eyebrow="Body"
              title="Composition trend"
              action={
                <div className="flex gap-1.5 rounded-xl p-1 bg-[color-mix(in_oklab,var(--text)_7%,transparent)]">
                  {[
                    { k: "weight", l: "Weight" },
                    { k: "bodyFat", l: "Body fat" },
                  ].map(({ k, l }) => (
                    <button
                      key={k}
                      onClick={() => setMetric(k)}
                      className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer
                        ${metric === k ? "text-[#07090d]" : "text-dim hover:text-[var(--text)]"}`}
                    >
                      {metric === k && (
                        <motion.span layoutId="metric-pill" className="absolute inset-0 rounded-lg grad-bg"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                      )}
                      <span className="relative z-10">{l}</span>
                    </button>
                  ))}
                </div>
              }
            />
            <div className="h-60 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bodyMetrics} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="currentColor" className="text-dim" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "currentColor" }} className="text-dim" />
                  <YAxis domain={["dataMin - 2", "dataMax + 1"]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "currentColor" }} className="text-dim" width={42} />
                  <Tooltip content={<Tip unit={metric === "weight" ? "kg" : "%"} />} />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="#22d3ee"
                    strokeWidth={2.75}
                    fill="url(#areaGrad)"
                    dot={{ r: 3.5, fill: "#22d3ee", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--bg)" }}
                    animationDuration={1300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-dim">
              <Scale size={14} className="text-cyan-700 dark:text-cyan-300" />
              {metric === "weight"
                ? `Down ${(bodyMetrics[0].weight - bodyMetrics.at(-1).weight).toFixed(1)} kg since May, holding strength gains.`
                : `Body fat down ${(bodyMetrics[0].bodyFat - bodyMetrics.at(-1).bodyFat).toFixed(1)} points while lifting heavier.`}
            </div>
          </GlassCard>
        </motion.div>

        {/* PRs */}
        <motion.div variants={riseIn}>
          <SectionHeading eyebrow="Records" title="Personal records" subtitle="Every best, badged and dated." />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {personalRecords.map((pr, i) => {
              const t = TIER[pr.tier];
              const Icon = t.icon;
              const improved = pr.unit === "min" ? pr.delta < 0 : pr.delta > 0;
              return (
                <motion.div
                  key={pr.lift}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 3) * 0.08, duration: 0.45 }}
                >
                  <GlassCard className="p-5 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${t.ring} opacity-25 blur-md`} />
                      <div className={`relative grid place-items-center h-13 w-13 rounded-2xl p-3.5 bg-gradient-to-br ${t.ring}`}>
                        <Icon size={20} className="text-[#07090d]" strokeWidth={2.3} />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{pr.lift}</div>
                      <div className="font-display text-2xl font-bold mt-0.5">
                        {pr.value}<span className="text-sm text-dim font-sans font-medium ml-1">{pr.unit}</span>
                      </div>
                      <div className="text-[11px] text-dim mt-0.5">{pr.date}</div>
                    </div>
                    <div className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold
                                     ${improved ? "text-[var(--accent)]" : "text-rose-600 dark:text-rose-300"}`}>
                      {improved ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {pr.delta > 0 ? "+" : ""}{pr.delta}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* lifetime */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="relative overflow-hidden p-7">
            <div className="absolute inset-0 grad-bg opacity-[0.08]" />
            <div className="relative grid gap-6 sm:grid-cols-3 text-center">
              {[
                { v: user.totalWorkouts, l: "Workouts logged", s: "" },
                { v: Math.round(user.totalMinutes / 60), l: "Hours trained", s: "h" },
                { v: Math.round(user.totalVolumeKg / 1000), l: "Tonnes lifted", s: "t" },
              ].map((x) => (
                <div key={x.l}>
                  <div className="font-display text-4xl font-bold grad-text">
                    <AnimatedCounter value={x.v} suffix={x.s} />
                  </div>
                  <div className="text-dim text-sm mt-1.5">{x.l}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Page>
  );
}
