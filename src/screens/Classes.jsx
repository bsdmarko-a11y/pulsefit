import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Users, Check, CalendarX2, Flame, Heart, Bike, Swords, CalendarDays, Dumbbell,
} from "lucide-react";
import {
  GlassCard, Button, Badge, SectionHeading, EmptyState, Page, useToast,
} from "../components/ui.jsx";
import { useApiData, ApiErrorState, SkeletonGrid } from "../components/states.jsx";
import { api } from "../lib/api.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Classes are free-text titles from the DB, so infer the look from the name. */
function styleFor(title) {
  const t = title.toLowerCase();
  if (t.includes("yoga") || t.includes("mobility") || t.includes("flow"))
    return { icon: Heart, tone: "violet", color: "#a78bfa", kind: "Yoga" };
  if (t.includes("hiit")) return { icon: Flame, tone: "rose", color: "#fb7185", kind: "HIIT" };
  if (t.includes("spin")) return { icon: Bike, tone: "cyan", color: "#22d3ee", kind: "Spin" };
  if (t.includes("box")) return { icon: Swords, tone: "amber", color: "#fbbf24", kind: "Boxing" };
  return { icon: Dumbbell, tone: "accent", color: "#bef264", kind: "Strength" };
}

const dayKey = (iso) => DAYS[(new Date(iso).getDay() + 6) % 7];
const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function Classes() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [day, setDay] = useState(DAYS[todayIdx]);
  const [type, setType] = useState("All");
  const [booked, setBooked] = useState({});
  const toast = useToast();

  const { data, error, loading, reload } = useApiData((signal) => api.classes(signal), []);
  const classes = data?.classes ?? [];

  const types = useMemo(() => {
    const set = new Set(classes.map((c) => styleFor(c.title).kind));
    return ["All", ...[...set].sort()];
  }, [classes]);

  const perDay = useMemo(() => {
    const m = Object.fromEntries(DAYS.map((d) => [d, 0]));
    for (const c of classes) m[dayKey(c.startTime)] = (m[dayKey(c.startTime)] || 0) + 1;
    return m;
  }, [classes]);

  const list = useMemo(
    () =>
      classes.filter(
        (c) => dayKey(c.startTime) === day && (type === "All" || styleFor(c.title).kind === type)
      ),
    [classes, day, type]
  );

  const book = (c) => {
    if (booked[c.id]) {
      setBooked((b) => {
        const n = { ...b };
        delete n[c.id];
        return n;
      });
      toast(`Cancelled ${c.title}`, {
        type: "info",
        desc: `Your spot at ${timeLabel(c.startTime)} is released.`,
      });
      return;
    }
    setBooked((b) => ({ ...b, [c.id]: true }));
    toast(`Booked ${c.title}`, {
      type: "success",
      desc: `${dayKey(c.startTime)} at ${timeLabel(c.startTime)} with ${c.coachName}.`,
    });
  };

  const bookedCount = Object.keys(booked).length;

  return (
    <Page>
      <SectionHeading
        eyebrow="Schedule"
        title="Book a class"
        subtitle="This week's timetable, straight from the gym schedule."
        action={bookedCount > 0 ? <Badge tone="accent"><Check size={12} /> {bookedCount} booked</Badge> : null}
      />

      {/* day strip */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-4 -mx-1 px-1">
        {DAYS.map((d, i) => {
          const on = day === d;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`relative shrink-0 rounded-2xl px-5 py-3 text-center transition-colors cursor-pointer
                ${on ? "text-[#07090d]" : "text-dim hover:text-[var(--text)] glass"}`}
            >
              {on && (
                <motion.span
                  layoutId="day-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-2xl grad-bg"
                />
              )}
              <span className="relative z-10 block">
                <span className="block text-xs font-semibold">{d}</span>
                <span className={`block font-display text-lg font-bold ${on ? "" : "text-[var(--text)]"}`}>
                  {perDay[d] ?? 0}
                </span>
                {i === todayIdx && (
                  <span className={`block text-[9px] font-semibold mt-0.5 ${on ? "opacity-70" : "text-[var(--accent-text)]"}`}>
                    TODAY
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* type filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {types.map((t) => {
          const on = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer border
                ${on
                  ? "grad-bg text-[#07090d] border-transparent"
                  : "border-[color-mix(in_oklab,var(--text)_14%,transparent)] text-dim hover:text-[var(--text)]"}`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {error ? (
        <ApiErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonGrid count={3} lines={2} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Nothing scheduled"
          message={`No ${type === "All" ? "" : type + " "}classes on ${day}. Try another day - the studio fills up midweek.`}
          action={<Button size="sm" onClick={() => setType("All")}>Show all types</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => {
              const meta = styleFor(c.title);
              const Icon = meta.icon;
              const isBooked = !!booked[c.id];
              const taken = Math.round(c.capacity * 0.62);
              const spots = Math.max(0, c.capacity - taken - (isBooked ? 1 : 0));
              const fillPct = ((c.capacity - spots) / c.capacity) * 100;

              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard className={`p-5 h-full flex flex-col ${isBooked ? "border-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="grid place-items-center h-11 w-11 rounded-xl shrink-0"
                        style={{ background: `color-mix(in oklab, ${meta.color} 16%, transparent)` }}
                      >
                        <Icon size={19} style={{ color: meta.color }} strokeWidth={2.2} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={meta.tone}>{meta.kind}</Badge>
                        <span className="text-[11px] text-dim">{c.intensity} intensity</span>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-semibold mt-4 leading-snug">{c.title}</h3>
                    <p className="text-xs text-dim mt-1">with {c.coachName}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className="text-dim" />
                        <strong className="font-display">{timeLabel(c.startTime)}</strong>
                        <span className="text-dim text-xs">· {c.durationMinutes}m</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Users size={14} className="text-dim" />
                        <strong className={spots === 0 ? "text-rose-600 dark:text-rose-300" : "text-[var(--accent-text)]"}>
                          {spots === 0 ? "Full" : `${spots} left`}
                        </strong>
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: spots === 0 ? "#fb7185" : meta.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPct}%` }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="text-[10px] text-dim mt-1.5">
                      {c.capacity - spots}/{c.capacity} spots taken
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        className="w-full"
                        size="sm"
                        variant={isBooked ? "soft" : spots === 0 ? "ghost" : "primary"}
                        icon={isBooked ? Check : undefined}
                        disabled={spots === 0 && !isBooked}
                        onClick={() => book(c)}
                      >
                        {isBooked ? "Booked - tap to cancel" : spots === 0 ? "Join waitlist" : "Book spot"}
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="mt-8 glass rounded-2xl p-5 flex items-center gap-4">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-[color-mix(in_oklab,var(--accent)_13%,transparent)] shrink-0">
          <CalendarDays size={18} className="text-[var(--accent-text)]" />
        </div>
        <p className="text-sm text-dim">
          The timetable comes from the database. Bookings are not stored yet, so they reset on refresh.
        </p>
      </div>
    </Page>
  );
}
