import { motion } from "framer-motion";
import {
  LayoutDashboard, Dumbbell, Timer, TrendingUp, CalendarDays, User,
  Sun, Moon, LogOut,
} from "lucide-react";
import { Logo, useToast } from "./ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "library", label: "Workouts", icon: Dumbbell },
  { key: "live", label: "Live", icon: Timer },
  { key: "progress", label: "Progress", icon: TrendingUp },
  { key: "classes", label: "Classes", icon: CalendarDays },
  { key: "profile", label: "Profile", icon: User },
];

export function initialsOf(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PF";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/* ------------------------------------------------------------ ThemeToggle */

export function ThemeToggle({ theme, onToggle, compact = false }) {
  const dark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--text)_14%,transparent)]
        bg-[color-mix(in_oklab,var(--text)_6%,transparent)] transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]
        cursor-pointer ${compact ? "h-8 w-[58px]" : "h-9 w-[64px]"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 34 }}
        className={`absolute grid place-items-center rounded-full grad-bg text-[#07090d] ${compact ? "h-6 w-6" : "h-7 w-7"}`}
        style={{ left: dark ? 4 : "calc(100% - 4px)", translateX: dark ? 0 : "-100%" }}
      >
        {dark ? <Moon size={compact ? 13 : 14} strokeWidth={2.6} /> : <Sun size={compact ? 13 : 14} strokeWidth={2.6} />}
      </motion.span>
    </button>
  );
}

/* ---------------------------------------------------------------- Sidebar */

export function Sidebar({ active, onNavigate, theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const signOut = async () => {
    await logout();
    toast("Signed out", { type: "info", desc: "See you at the next session." });
    onNavigate("landing");
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-[244px] flex-col gap-2 p-5
                      border-r border-[color-mix(in_oklab,var(--text)_9%,transparent)]
                      bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] backdrop-blur-xl">
      <button onClick={() => onNavigate("dashboard")} className="mb-6 text-left cursor-pointer">
        <Logo />
      </button>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ key, label, icon: Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                transition-colors cursor-pointer ${on ? "text-[#07090d]" : "text-dim hover:text-[var(--text)]"}`}
            >
              {on && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-xl grad-bg"
                />
              )}
              <Icon size={18} strokeWidth={2.2} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-xl grad-bg shrink-0
                            font-display text-xs font-bold text-[#07090d]">
              {initialsOf(user?.fullName)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.fullName || "Athlete"}</div>
              <div className="text-[11px] text-dim truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg py-2
                       text-xs font-semibold text-dim hover:text-rose-600 dark:hover:text-rose-300
                       bg-[color-mix(in_oklab,var(--text)_7%,transparent)] transition-colors cursor-pointer"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-dim font-medium">Theme</span>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------- BottomNav */

export function BottomNav({ active, onNavigate }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[color-mix(in_oklab,var(--text)_10%,transparent)]
                    bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-6">
        {NAV.map(({ key, label, icon: Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className="relative flex flex-col items-center gap-1 py-2.5 cursor-pointer"
            >
              {on && (
                <motion.span
                  layoutId="bottomnav-active"
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                  className="absolute -top-px h-[3px] w-9 rounded-full grad-bg"
                />
              )}
              <Icon
                size={19}
                strokeWidth={on ? 2.6 : 2}
                className={on ? "text-[var(--accent-text)]" : "text-dim"}
              />
              <span className={`text-[10px] font-medium ${on ? "text-[var(--text)]" : "text-dim"}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------- TopBar */

export function TopBar({ title, subtitle, theme, onToggleTheme, onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const signOut = async () => {
    await logout();
    toast("Signed out", { type: "info", desc: "See you at the next session." });
    onNavigate("landing");
  };

  return (
    <header className="sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 mb-6
                       border-b border-[color-mix(in_oklab,var(--text)_8%,transparent)]
                       bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="lg:hidden mb-0.5">
            <button onClick={() => onNavigate("dashboard")} className="cursor-pointer">
              <Logo size="sm" />
            </button>
          </div>
          <h1 className="hidden lg:block font-display text-xl font-bold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="hidden lg:block text-xs text-dim mt-0.5 truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden sm:block text-sm font-semibold truncate max-w-[160px]">
            {user?.fullName}
          </span>

          <div className="lg:hidden">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
          </div>

          <button
            onClick={() => onNavigate("profile")}
            className="relative grid place-items-center h-9 w-9 rounded-full grad-bg text-[#07090d]
                       font-display font-bold text-xs cursor-pointer hover:brightness-110 transition"
            aria-label="Open profile"
          >
            {initialsOf(user?.fullName)}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--bg)]" />
          </button>

          <button
            onClick={signOut}
            aria-label="Log out"
            title="Log out"
            className="grid place-items-center h-9 w-9 rounded-full transition-colors cursor-pointer
                       text-dim hover:text-rose-600 dark:hover:text-rose-300
                       bg-[color-mix(in_oklab,var(--text)_7%,transparent)]"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
