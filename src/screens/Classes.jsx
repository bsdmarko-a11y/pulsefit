import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Users, Check, CalendarX2, Flame, Heart, Bike, Swords, CalendarDays,
} from "lucide-react";
import {
  GlassCard, Button, Badge, SectionHeading, EmptyState, Page, useToast,
} from "../components/ui.jsx";
import { classes, classDays } from "../data/mockData.js";

const TYPE_META = {
  Yoga: { icon: Heart, tone: "violet", color: "#a78bfa" },
  HIIT: { icon: Flame, tone: "rose", color: "#fb7185" },
  Spin: { icon: Bike, tone: "cyan", color: "#22d3ee" },
  Boxing: { icon: Swords, tone: "amber", color: "#fbbf24" },
};

const TYPES = ["All", "Yoga", "HIIT", "Spin", "Boxing"];

export default function Classes() {
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [day, setDay] = useState(classDays[todayIdx]);
  const [type, setType] = useState("All");
  const [booked, setBooked] = useState({});
  const toast = useToast();

  const list = useMemo(
    () => classes.filter((c) => c.day === day && (type === "All" || c.type === type)),
    [day, type]
  );

  const book = (c) => {
    if (booked[c.id]) {
      setBooked((b) => {
        const n = { ...b };
        delete n[c.id];
        return n;
      });
      toast(`Cancelled ${c.name}`, { type: "info", desc: `Your spot on ${c.day} ${c.time} is released.` });
      return;
    }
    setBooked((b) => ({ ...b, [c.id]: true }));
    toast(`Booked ${c.name}`, {
      type: "success",
      desc: `${c.day} at ${c.time} with ${c.coach}. See you there.`,
    });
  };

  const bookedCount = Object.keys(booked).length;

  return (
    <Page>
      <SectionHeading
        eyebrow="Schedule"
        title="Book a class"
        subtitle="13 classes across the week. Live spot counts, instant confirmation."
        action={
          bookedCount > 0 ? (
            <Badge tone="accent"><Check size={12} /> {bookedCount} booked</Badge>
          ) : null
        }
      />

      {/* day strip */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-4 -mx-1 px-1">
        {classDays.map((d, i) => {
          const on = day === d;
          const count = classes.filter((c) => c.day === d).length;
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
                <span className={`block font-display text-lg font-bold ${on ? "" : "text-[var(--text)]"}`}>{count}</span>
                {i === todayIdx && (
                  <span className={`block text-[9px] font-semibold mt-0.5 ${on ? "opacity-70" : "text-[var(--accent)]"}`}>
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
        {TYPES.map((t) => {
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

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Nothing scheduled"
          message={`No ${type === "All" ? "" : type + " "}classes on ${day}. Try another day — the studio fills up fast midweek.`}
          action={<Button size="sm" onClick={() => setType("All")}>Show all types</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => {
              const meta = TYPE_META[c.type];
              const Icon = meta.icon;
              const isBooked = !!booked[c.id];
              const spots = isBooked ? c.spots - 1 : c.spots;
              const full = spots <= 0 && !isBooked;
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
                        <Badge tone={meta.tone}>{c.type}</Badge>
                        <span className="text-[11px] text-dim">{c.intensity} intensity</span>
                      </div>
                    </div>

                    <h3 className="font-display text-lg font-semibold mt-4 leading-snug">{c.name}</h3>
                    <p className="text-xs text-dim mt-1">with {c.coach}</p>

                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} className="text-dim" />
                        <strong className="font-display">{c.time}</strong>
                        <span className="text-dim text-xs">· {c.duration}m</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <Users size={14} className="text-dim" />
                        <strong className={full ? "text-rose-600 dark:text-rose-300" : "text-[var(--accent)]"}>
                          {full ? "Full" : `${spots} left`}
                        </strong>
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 rounded-full bg-[color-mix(in_oklab,var(--text)_12%,transparent)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: full ? "#fb7185" : meta.color }}
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
                        variant={isBooked ? "soft" : full ? "ghost" : "primary"}
                        icon={isBooked ? Check : undefined}
                        disabled={full}
                        onClick={() => book(c)}
                      >
                        {isBooked ? "Booked — tap to cancel" : full ? "Join waitlist" : "Book spot"}
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
          <CalendarDays size={18} className="text-[var(--accent)]" />
        </div>
        <p className="text-sm text-dim">
          Classes open for booking 7 days ahead. Cancel free up to 2 hours before the start time.
        </p>
      </div>
    </Page>
  );
}
