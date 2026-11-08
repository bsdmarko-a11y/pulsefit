import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, Activity } from "lucide-react";

/* ------------------------------------------------------------------ Logo */

export function Logo({ size = "md", withMark = true }) {
  const scale = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];
  const box = { sm: 26, md: 34, lg: 40 }[size];
  return (
    <div className="flex items-center gap-2.5 select-none">
      {withMark && (
        <span className="relative grid place-items-center shrink-0" style={{ width: box, height: box }}>
          <span className="absolute inset-0 rounded-xl grad-bg opacity-25 blur-[6px]" />
          <span className="absolute inset-0 rounded-xl grad-bg opacity-90" />
          <Activity size={box * 0.56} strokeWidth={2.75} className="relative text-[#07090d]" />
        </span>
      )}
      <span className={`font-display font-bold tracking-tight grad-text ${scale}`}>PulseFit</span>
    </div>
  );
}

/* ------------------------------------------------------------- GlassCard */

export function GlassCard({ className = "", hover = true, children, ...rest }) {
  return (
    <div
      className={`glass rounded-2xl ${hover ? "hover-lift" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Button */

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  ...rest
}) {
  const sizes = {
    sm: "px-3.5 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  }[size];

  const variants = {
    primary:
      "grad-bg text-[#06080b] font-semibold shadow-[0_10px_34px_-12px_color-mix(in_oklab,var(--accent)_80%,transparent)] hover:brightness-110",
    ghost:
      "bg-transparent border border-[color-mix(in_oklab,var(--text)_16%,transparent)] hover:border-[color-mix(in_oklab,var(--accent)_55%,transparent)] hover:text-[var(--accent-text)]",
    soft:
      "bg-[color-mix(in_oklab,var(--text)_8%,transparent)] hover:bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]",
    danger:
      "bg-[color-mix(in_oklab,#f43f5e_18%,transparent)] text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-[color-mix(in_oklab,#f43f5e_28%,transparent)]",
  }[variant];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors
        disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${sizes} ${variants} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === "lg" ? 19 : 16} strokeWidth={2.4} />}
      {children}
    </motion.button>
  );
}

/* --------------------------------------------------------------- Counter */

export function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "", delay = 0, className = "" }) {
  const ref = useRef(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 22, mass: 1 });
  const [display, setDisplay] = useState("0");

  // Run on mount. Viewport-gated counters silently stayed at 0 when the
  // element was already on screen and the user never scrolled.
  useEffect(() => {
    const id = setTimeout(() => mv.set(value), delay * 1000);
    return () => clearTimeout(id);
  }, [value, delay, mv]);

  useEffect(
    () =>
      spring.on("change", (v) =>
        setDisplay(
          v.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        )
      ),
    [spring, decimals]
  );

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ----------------------------------------------------------- ProgressRing */

const TONES = {
  lime: ["#bef264", "#84cc16"],
  cyan: ["#22d3ee", "#0ea5e9"],
  violet: ["#a78bfa", "#6366f1"],
  amber: ["#fbbf24", "#f97316"],
  rose: ["#fb7185", "#e11d48"],
};

export function ProgressRing({
  value,
  target,
  size = 128,
  stroke = 10,
  tone = "lime",
  label,
  unit = "",
  delay = 0,
  children,
}) {
  const pct = Math.min(1, target ? value / target : 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [from, to] = TONES[tone] || TONES.lime;
  const gid = `ring-${tone}-${size}-${label ?? "x"}`.replace(/\s+/g, "");

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 overflow-visible">
          <defs>
            <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 10px ${to}66)` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          {children ?? (
            <div>
              <div className="font-display text-2xl font-bold leading-none">
                <AnimatedCounter value={value} delay={delay} />
                <span className="text-sm text-dim font-sans font-medium">{unit}</span>
              </div>
              <div className="text-[11px] text-dim mt-1">of {target}{unit}</div>
            </div>
          )}
        </div>
      </div>
      {label && <div className="text-xs font-medium text-dim text-center">{label}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "bg-[color-mix(in_oklab,var(--text)_9%,transparent)] text-dim",
    accent: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent-text)] border border-[color-mix(in_oklab,var(--accent)_38%,transparent)]",
    cyan: "bg-cyan-400/12 text-cyan-700 dark:text-cyan-300 border border-cyan-400/25",
    amber: "bg-amber-400/12 text-amber-600 dark:text-amber-300 border border-amber-400/25",
    rose: "bg-rose-400/12 text-rose-600 dark:text-rose-300 border border-rose-400/25",
    violet: "bg-violet-400/12 text-violet-700 dark:text-violet-300 border border-violet-400/25",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tones} ${className}`}>
      {children}
    </span>
  );
}

export function DifficultyPill({ level }) {
  const map = { Beginner: "accent", Intermediate: "cyan", Advanced: "rose" };
  return <Badge tone={map[level] || "neutral"}>{level}</Badge>;
}

/* --------------------------------------------------------------- Section */

export function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] grad-text mb-1.5">{eyebrow}</div>
        )}
        <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-dim text-sm mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------ EmptyState */

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl py-14 px-6 text-center"
    >
      <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]">
        {Icon && <Icon size={24} className="text-[var(--accent-text)]" />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-dim text-sm mt-1.5 max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Toasts */

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

const TOAST_ICON = { success: CheckCircle2, error: AlertTriangle, info: Info };
const TOAST_TONE = {
  success: "text-[var(--accent-text)] border-[color-mix(in_oklab,var(--accent)_38%,transparent)]",
  error: "text-rose-600 dark:text-rose-300 border-rose-400/35",
  info: "text-cyan-700 dark:text-cyan-300 border-cyan-400/35",
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, message, type: opts.type || "success", desc: opts.desc }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), opts.duration ?? 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-[90] left-1/2 -translate-x-1/2 bottom-24 sm:bottom-auto sm:top-6 sm:left-auto sm:right-6 sm:translate-x-0 flex flex-col gap-2.5 w-[min(92vw,380px)] pointer-events-none">
        <AnimatePresence>
          {items.map((t) => {
            const Icon = TOAST_ICON[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={`glass pointer-events-auto rounded-xl px-4 py-3 flex items-start gap-3 border ${TOAST_TONE[t.type]}`}
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug">{t.message}</div>
                  {t.desc && <div className="text-xs text-dim mt-0.5">{t.desc}</div>}
                </div>
                <button
                  onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))}
                  className="text-dim hover:text-[var(--text)] transition-colors cursor-pointer"
                  aria-label="Dismiss"
                >
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ------------------------------------------------------------ Page shell */

export const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
};

export function Page({ children, className = "" }) {
  return (
    <motion.div {...pageMotion} className={`relative z-10 ${className}`}>
      {children}
    </motion.div>
  );
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const riseIn = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
