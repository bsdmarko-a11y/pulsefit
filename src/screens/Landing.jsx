import { motion } from "framer-motion";
import {
  Play, Dumbbell, Flame, Timer, Trophy, CalendarDays, ArrowRight, Check, Activity,
} from "lucide-react";
import { Logo, Button, AnimatedCounter, GlassCard, Page, stagger, riseIn } from "../components/ui.jsx";
import { ThemeToggle } from "../components/Shell.jsx";
import { Skeleton } from "../components/states.jsx";
import { useApiData } from "../components/states.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { quoteOfTheDay } from "../data/mockData.js";

const FEATURES = [
  { icon: Dumbbell, title: "Smart programming", text: "Blocks that adapt to the weight you actually lifted, not the weight you planned." },
  { icon: Timer, title: "Live workout mode", text: "Full-screen rest timers, set tracking and a finish worth celebrating." },
  { icon: Flame, title: "Streaks that stick", text: "Momentum you can see. Miss a day and the comeback plan writes itself." },
  { icon: Trophy, title: "PRs on record", text: "Every personal best logged, badged and charted over time." },
  { icon: CalendarDays, title: "Class booking", text: "Yoga, HIIT, Spin and Boxing. Live spot counts, one-tap booking." },
  { icon: Activity, title: "Progress you trust", text: "Strength curves, body metrics and weekly volume in one view." },
];

export default function Landing({ onNavigate, theme, onToggleTheme }) {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useApiData((signal) => api.stats(signal), []);

  // Logged out, "Start Your Workout" sends you to sign up; logged in it opens
  // the app, exactly as the brief asks.
  const startHref = user ? "dashboard" : "signup";

  const heroStats = [
    { label: "Active members", value: stats?.members ?? 0, suffix: "" },
    { label: "Workouts completed", value: stats?.workoutsCompleted ?? 0, suffix: "" },
    { label: "Classes this week", value: stats?.classesThisWeek ?? 0, suffix: "" },
  ];

  return (
    <Page className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]
                         border-b border-[color-mix(in_oklab,var(--text)_8%,transparent)]">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-dim">
            <a href="#how" className="hover:text-[var(--text)] transition-colors">Features</a>
            <a href="#stats" className="hover:text-[var(--text)] transition-colors">Results</a>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            {user ? (
              <Button size="sm" onClick={() => onNavigate("dashboard")}>Open app</Button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="hidden sm:block text-sm text-dim hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <Button size="sm" onClick={() => onNavigate("signup")}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-5 pt-16 sm:pt-24 pb-16 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={riseIn} className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-7
                        bg-[color-mix(in_oklab,var(--accent)_13%,transparent)]
                        border border-[color-mix(in_oklab,var(--accent)_30%,transparent)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="text-xs font-semibold text-[var(--accent-text)]">
              {statsLoading
                ? "Loading this week's schedule"
                : `${stats?.classesThisWeek ?? 0} classes running this week`}
            </span>
          </motion.div>

          <motion.h1
            variants={riseIn}
            className="font-display font-bold tracking-tight leading-[1.02]
                       text-[clamp(2.6rem,9vw,5.5rem)]"
          >
            Train smarter.
            <br />
            <span className="grad-text">Get stronger.</span>
          </motion.h1>

          <motion.p variants={riseIn} className="mx-auto mt-6 max-w-xl text-dim text-base sm:text-lg leading-relaxed">
            PulseFit plans your sessions, times your rest, books your classes and keeps the
            streak alive — so the only thing left to do is show up and lift.
          </motion.p>

          <motion.div variants={riseIn} className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" icon={Play} onClick={() => onNavigate(startHref)}>Start Your Workout</Button>
            <Button size="lg" variant="ghost" icon={ArrowRight} onClick={() => onNavigate(user ? "dashboard" : "login")}>
              {user ? "See the dashboard" : "I already have an account"}
            </Button>
          </motion.div>

          <motion.div variants={riseIn} className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-dim">
            {["No equipment required to start", "Cancel anytime", "First 14 days free"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[var(--accent-text)]" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-16"
        >
          <div className="absolute -inset-x-10 -top-10 bottom-10 grad-bg opacity-[0.14] blur-3xl rounded-[48px]" />
          <GlassCard hover={false} className="relative p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dim">
                A look inside
              </span>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-dim
                               bg-[color-mix(in_oklab,var(--text)_8%,transparent)]">
                Sample data
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Flame, label: "Current streak", value: "18 days", tone: "text-orange-600 dark:text-orange-400" },
                { icon: Timer, label: "Active this week", value: "303 min", tone: "text-cyan-700 dark:text-cyan-300" },
                { icon: Trophy, label: "PRs this month", value: "4 new", tone: "text-amber-600 dark:text-amber-300" },
              ].map(({ icon: Icon, label, value, tone }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.1, duration: 0.5 }}
                  className="rounded-xl p-4 text-left bg-[color-mix(in_oklab,var(--text)_5%,transparent)]
                             border border-[color-mix(in_oklab,var(--text)_8%,transparent)]"
                >
                  <Icon size={18} className={tone} />
                  <div className="font-display text-xl font-bold mt-2.5">{value}</div>
                  <div className="text-xs text-dim mt-0.5">{label}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 rounded-xl p-5 bg-[color-mix(in_oklab,var(--text)_5%,transparent)]
                            border border-[color-mix(in_oklab,var(--text)_8%,transparent)] text-left">
              <div className="flex items-end gap-1.5 h-28">
                {[42, 68, 30, 86, 54, 95, 48, 72, 62, 100, 58, 80].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 rounded-t-md grad-bg"
                    style={{ opacity: 0.35 + (h / 100) * 0.65 }}
                  />
                ))}
              </div>
              <div className="mt-3 text-xs text-dim">Weekly training volume · last 12 weeks</div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* stats */}
      <section id="stats" className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {heroStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
            >
              <GlassCard className="p-7 text-center">
                <div className="font-display text-4xl sm:text-5xl font-bold grad-text">
                  {statsLoading ? (
                    <Skeleton className="h-11 w-28 mx-auto" />
                  ) : (
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  )}
                </div>
                <div className="text-dim text-sm mt-2">{s.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-14">
        <div className="text-center mb-12">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] grad-text mb-3">Everything in one app</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Built for people who actually train
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
            >
              <GlassCard className="p-6 h-full">
                <div className="grid place-items-center h-11 w-11 rounded-xl
                                bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] mb-4">
                  <f.icon size={20} className="text-[var(--accent-text)]" strokeWidth={2.2} />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="text-dim text-sm mt-2 leading-relaxed">{f.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* quote + CTA */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <GlassCard hover={false} className="relative overflow-hidden p-8 sm:p-14 text-center">
          <div className="absolute inset-0 grad-bg opacity-[0.1]" />
          <div className="relative">
            <p className="font-display text-xl sm:text-3xl font-semibold leading-snug max-w-2xl mx-auto">
              “{quoteOfTheDay.text}”
            </p>
            <p className="text-dim text-sm mt-4">— {quoteOfTheDay.author}</p>
            <div className="mt-9">
              <Button size="lg" icon={Play} onClick={() => onNavigate(startHref)}>Start Your Workout</Button>
            </div>
          </div>
        </GlassCard>
      </section>

      <footer className="border-t border-[color-mix(in_oklab,var(--text)_8%,transparent)] mt-10">
        <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo size="sm" />
          <p className="text-xs text-dim">© {new Date().getFullYear()} PulseFit. Train smarter. Get stronger.</p>
          <div className="flex gap-5 text-xs text-dim">
            <a href="#how" className="hover:text-[var(--text)] transition-colors">Features</a>
            <button onClick={() => onNavigate(user ? "classes" : "signup")} className="hover:text-[var(--text)] transition-colors cursor-pointer">Classes</button>
            <button onClick={() => onNavigate(user ? "profile" : "login")} className="hover:text-[var(--text)] transition-colors cursor-pointer">Account</button>
          </div>
        </div>
      </footer>
    </Page>
  );
}
