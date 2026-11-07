import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Dumbbell, Timer, Zap, Plus, SearchX, Repeat } from "lucide-react";
import {
  GlassCard, Button, Badge, DifficultyPill, SectionHeading, EmptyState, Page, useToast,
} from "../components/ui.jsx";
import { exercises, muscleGroups } from "../data/mockData.js";

export default function Library({ onNavigate }) {
  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const toast = useToast();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (group === "All" || e.group === group) &&
        (!q || e.name.toLowerCase().includes(q) || e.equipment.toLowerCase().includes(q))
    );
  }, [group, query]);

  return (
    <Page>
      <SectionHeading
        eyebrow="Library"
        title="Workout library"
        subtitle="24 movements across six muscle groups. Filter, add to today's session, go."
        action={
          <Button variant="ghost" size="sm" icon={Repeat} onClick={() => { setGroup("All"); setQuery(""); }}>
            Reset
          </Button>
        }
      />

      {/* search */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises or equipment..."
          className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none
                     placeholder:text-[var(--text-dim)]
                     focus:border-[color-mix(in_oklab,var(--accent)_55%,transparent)] transition-colors"
        />
      </div>

      {/* filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 -mx-1 px-1">
        {muscleGroups.map((g) => {
          const on = group === g;
          const count = g === "All" ? exercises.length : exercises.filter((e) => e.group === g).length;
          return (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer
                ${on ? "text-[#07090d]" : "text-dim hover:text-[var(--text)] border border-[color-mix(in_oklab,var(--text)_12%,transparent)]"}`}
            >
              {on && (
                <motion.span
                  layoutId="group-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full grad-bg"
                />
              )}
              <span className="relative z-10">
                {g} <span className={on ? "opacity-60" : "opacity-50"}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* grid */}
      {list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches here"
          message={`Nothing in ${group} matches "${query}". Try a different muscle group or clear the search.`}
          action={<Button size="sm" onClick={() => { setQuery(""); setGroup("All"); }}>Clear filters</Button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((ex, i) => (
              <motion.div
                key={ex.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className="p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0
                                    bg-[color-mix(in_oklab,var(--accent)_13%,transparent)]">
                      <Dumbbell size={17} className="text-[var(--accent)]" />
                    </div>
                    <DifficultyPill level={ex.difficulty} />
                  </div>

                  <h3 className="font-display text-lg font-semibold mt-4 leading-snug">{ex.name}</h3>
                  <p className="text-xs text-dim mt-1">{ex.group} · {ex.equipment}</p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="rounded-lg py-2 text-center bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                      <div className="font-display text-base font-bold">{ex.sets}</div>
                      <div className="text-[10px] text-dim">sets</div>
                    </div>
                    <div className="rounded-lg py-2 text-center bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                      <div className="font-display text-base font-bold">{ex.reps}</div>
                      <div className="text-[10px] text-dim">reps</div>
                    </div>
                    <div className="rounded-lg py-2 text-center bg-[color-mix(in_oklab,var(--text)_6%,transparent)]">
                      <div className="font-display text-base font-bold">{ex.minutes}</div>
                      <div className="text-[10px] text-dim">min</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-4 pt-4
                                  border-t border-[color-mix(in_oklab,var(--text)_8%,transparent)]">
                    <span className="inline-flex items-center gap-1.5 text-xs text-dim">
                      <Zap size={13} className="text-amber-600 dark:text-amber-300" /> {ex.kcal} kcal
                    </span>
                    <Button
                      size="sm"
                      variant="soft"
                      icon={Plus}
                      onClick={() => toast(`${ex.name} added`, { desc: "Queued for today's session", type: "success" })}
                    >
                      Add
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="ghost" icon={Timer} onClick={() => onNavigate("live")}>
          Go to live workout
        </Button>
      </div>
    </Page>
  );
}
