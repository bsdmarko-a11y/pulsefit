import { motion } from "framer-motion";
import {
  Trophy, Flame, Sunrise, Dumbbell, CalendarDays, Timer, Shield, Layers,
  Lock, Share2, Crown, Sparkles, LogOut, Target,
} from "lucide-react";
import {
  GlassCard, Button, Badge, SectionHeading, AnimatedCounter, Page, stagger, riseIn, useToast,
} from "../components/ui.jsx";
import { useApiData, Skeleton } from "../components/states.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { initialsOf } from "../components/Shell.jsx";
import { api } from "../lib/api.js";
import { achievements } from "../data/mockData.js";

const ICONS = {
  trophy: Trophy, flame: Flame, sunrise: Sunrise, dumbbell: Dumbbell,
  calendar: CalendarDays, timer: Timer, shield: Shield, layers: Layers,
};

const TIER_STYLE = {
  gold: "from-amber-300 to-yellow-500",
  silver: "from-slate-200 to-slate-400",
  bronze: "from-orange-300 to-orange-600",
  locked: "from-slate-600 to-slate-700",
};

export default function Profile({ onNavigate, theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { data, loading } = useApiData((signal) => api.dashboard(signal), []);

  const lifetime = data?.lifetime ?? { workouts: 0, minutes: 0 };
  const streak = data?.streak ?? 0;

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "today";

  const signOut = async () => {
    await logout();
    toast("Signed out", { type: "info", desc: "See you at the next session." });
    onNavigate("landing");
  };

  const stats = [
    { v: lifetime.workouts, l: "Workouts", s: "", icon: Dumbbell, tone: "text-[var(--accent)]" },
    { v: Math.round(lifetime.minutes / 60), l: "Hours trained", s: "h", icon: Timer, tone: "text-cyan-700 dark:text-cyan-300" },
    { v: lifetime.minutes, l: "Active minutes", s: "", icon: Layers, tone: "text-violet-700 dark:text-violet-300" },
    { v: streak, l: "Day streak", s: "", icon: Flame, tone: "text-orange-600 dark:text-orange-400" },
  ];

  return (
    <Page>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
        {/* header card */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="relative overflow-hidden p-7 sm:p-9">
            <div className="absolute inset-0 grad-bg opacity-[0.09]" />
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full grad-bg opacity-20 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-3xl grad-bg blur-lg opacity-45" />
                <div className="relative grid place-items-center h-24 w-24 rounded-3xl grad-bg
                                font-display text-3xl font-bold text-[#07090d]">
                  {initialsOf(user?.fullName)}
                </div>
                <span className="absolute -bottom-1 -right-1 grid place-items-center h-8 w-8 rounded-xl
                                 bg-[var(--bg)] border border-[color-mix(in_oklab,var(--accent)_45%,transparent)]">
                  <Crown size={15} className="text-amber-600 dark:text-amber-300" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="font-display text-3xl font-bold tracking-tight">{user?.fullName}</h1>
                <p className="text-dim text-sm mt-1">{user?.email} · member since {memberSince}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3.5">
                  <Badge tone="accent"><Sparkles size={11} /> PulseFit member</Badge>
                  <Badge tone="amber"><Flame size={11} /> {streak}-day streak</Badge>
                  <Badge tone="cyan"><Target size={11} /> {user?.weeklyGoalWorkouts}× / week goal</Badge>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Share2}
                  onClick={() => toast("Profile link copied", { desc: "Share your PulseFit progress." })}
                >
                  Share
                </Button>
                <Button size="sm" variant="danger" icon={LogOut} onClick={signOut}>
                  Log out
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* lifetime stats */}
        <motion.div variants={riseIn} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map(({ v, l, s, icon: Icon, tone }) => (
            <GlassCard key={l} className="p-5">
              <Icon size={18} className={tone} />
              <div className="font-display text-2xl sm:text-3xl font-bold mt-3">
                {loading ? <Skeleton className="h-8 w-20" /> : <AnimatedCounter value={v} suffix={s} />}
              </div>
              <div className="text-xs text-dim mt-1">{l}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* goals */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6">
            <SectionHeading eyebrow="Targets" title="Weekly goals" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl p-4 bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                <div className="text-xs text-dim">Workouts per week</div>
                <div className="font-display text-2xl font-bold mt-1">{user?.weeklyGoalWorkouts}</div>
              </div>
              <div className="rounded-xl p-4 bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                <div className="text-xs text-dim">Active minutes per week</div>
                <div className="font-display text-2xl font-bold mt-1">{user?.weeklyGoalMinutes}</div>
              </div>
            </div>
            <p className="text-[11px] text-dim mt-3">
              Set at sign-up. These drive the progress rings on your dashboard.
            </p>
          </GlassCard>
        </motion.div>

        {/* achievements */}
        <motion.div variants={riseIn}>
          <SectionHeading
            eyebrow="Achievements"
            title={`${earned.length} of ${achievements.length} unlocked`}
            subtitle="Sample badges - not wired to the database yet."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...earned, ...locked].map((a, i) => {
              const Icon = ICONS[a.icon] || Trophy;
              const style = TIER_STYLE[a.tier];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 3) * 0.08, duration: 0.45 }}
                >
                  <GlassCard className={`p-5 h-full flex items-start gap-4 ${a.earned ? "" : "opacity-70"}`}>
                    <div className="relative shrink-0">
                      {a.earned && <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style} opacity-30 blur-md`} />}
                      <div className={`relative grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br ${style}`}>
                        {a.earned
                          ? <Icon size={20} className="text-[#07090d]" strokeWidth={2.3} />
                          : <Lock size={17} className="text-slate-300" strokeWidth={2.3} />}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold truncate">{a.name}</h3>
                        {a.earned && <Badge tone="accent">Earned</Badge>}
                      </div>
                      <p className="text-xs text-dim mt-1 leading-relaxed">{a.desc}</p>
                      {!a.earned && (
                        <>
                          <div className="mt-3 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${a.progress}%` }}
                              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                              className="h-full grad-bg"
                            />
                          </div>
                          <div className="text-[10px] text-dim mt-1.5">{a.progress}% there</div>
                        </>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* preferences */}
        <motion.div variants={riseIn}>
          <GlassCard hover={false} className="p-6">
            <SectionHeading eyebrow="Preferences" title="App settings" />
            <div className="divide-y divide-[color-mix(in_oklab,var(--text)_8%,transparent)]">
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-semibold">Appearance</div>
                  <div className="text-xs text-dim mt-0.5">Currently {theme} mode</div>
                </div>
                <Button size="sm" variant="soft" onClick={onToggleTheme}>
                  Switch to {theme === "dark" ? "light" : "dark"}
                </Button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm font-semibold">Sign out</div>
                  <div className="text-xs text-dim mt-0.5">Clears the session cookie on this device</div>
                </div>
                <Button size="sm" variant="danger" icon={LogOut} onClick={signOut}>
                  Sign out
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </Page>
  );
}
