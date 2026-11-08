import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Dumbbell, Timer, Plus, SearchX, Check, Loader2, Play } from "lucide-react";
import {
  GlassCard, Button, DifficultyPill, SectionHeading, EmptyState, Page, useToast,
} from "../components/ui.jsx";
import { useApiData, ApiErrorState, SkeletonGrid } from "../components/states.jsx";
import { api } from "../lib/api.js";

const GROUPS = ["All", "Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

export default function Library({ onNavigate }) {
  const [group, setGroup] = useState("All");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(null);
  const [added, setAdded] = useState(() => new Set());
  const toast = useToast();

  const { data, error, loading, reload } = useApiData((signal) => api.exercises(null, signal), []);
  const exercises = data?.exercises ?? [];

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (group === "All" || e.muscleGroup === group) &&
        (!q || e.name.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q))
    );
  }, [exercises, group, query]);

  const addToToday = async (ex) => {
    setAdding(ex.id);
    try {
      const { added: name } = await api.addExercise(ex.id);
      setAdded((s) => new Set(s).add(ex.id));
      toast(`${name} added`, {
        type: "success",
        desc: `${ex.sets} sets queued in today's workout.`,
      });
    } catch (err) {
      toast("Could not add that", { type: "error", desc: err.message });
    } finally {
      setAdding(null);
    }
  };

  const counts = useMemo(() => {
    const m = { All: exercises.length };
    for (const e of exercises) m[e.muscleGroup] = (m[e.muscleGroup] || 0) + 1;
    return m;
  }, [exercises]);

  return (
    <Page>
      <SectionHeading
        eyebrow="Library"
        title="Workout library"
        subtitle="Add any movement to today's session, then head to Live mode."
        action={
          added.size > 0 ? (
            <Button size="sm" icon={Play} onClick={() => onNavigate("live")}>
              Start workout ({added.size})
            </Button>
          ) : null
        }
      />

      {/* search */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm outline-none
                     placeholder:text-[var(--text-dim)]
                     focus:border-[color-mix(in_oklab,var(--accent)_55%,transparent)] transition-colors"
        />
      </div>

      {/* filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 -mx-1 px-1">
        {GROUPS.map((g) => {
          const on = group === g;
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
                {g} <span className={on ? "opacity-60" : "opacity-50"}>{counts[g] ?? 0}</span>
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <ApiErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonGrid count={6} lines={2} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches here"
          message={
            query
              ? `Nothing in ${group} matches "${query}". Try a different muscle group or clear the search.`
              : `No exercises in ${group} yet.`
          }
          action={
            <Button size="sm" onClick={() => { setQuery(""); setGroup("All"); }}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((ex, i) => {
              const isAdded = added.has(ex.id);
              const busy = adding === ex.id;
              return (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard className={`p-5 h-full flex flex-col ${isAdded ? "border-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0
                                      bg-[color-mix(in_oklab,var(--accent)_13%,transparent)]">
                        <Dumbbell size={17} className="text-[var(--accent-text)]" />
                      </div>
                      <DifficultyPill level={ex.difficulty} />
                    </div>

                    <h3 className="font-display text-lg font-semibold mt-4 leading-snug">{ex.name}</h3>
                    <p className="text-xs text-dim mt-1">{ex.muscleGroup}</p>
                    {ex.description && (
                      <p className="text-xs text-dim mt-2.5 leading-relaxed line-clamp-2">{ex.description}</p>
                    )}

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
                        <div className="font-display text-base font-bold">{ex.restSeconds}s</div>
                        <div className="text-[10px] text-dim">rest</div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <Button
                        className="w-full"
                        size="sm"
                        variant={isAdded ? "soft" : "primary"}
                        icon={busy ? undefined : isAdded ? Check : Plus}
                        disabled={busy}
                        onClick={() => addToToday(ex)}
                      >
                        {busy ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : isAdded ? (
                          "In today's workout"
                        ) : (
                          "Add to today's workout"
                        )}
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && !error && list.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" icon={Timer} onClick={() => onNavigate("live")}>
            Go to live workout
          </Button>
        </div>
      )}
    </Page>
  );
}
