import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { DatabaseZap, RefreshCw, WifiOff } from "lucide-react";
import { GlassCard, Button } from "./ui.jsx";

/* ------------------------------------------------------------- useApiData */

/**
 * Fetch-on-mount with loading, error and refetch. `fetcher` receives an
 * AbortSignal so a screen change does not land a stale response.
 */
export function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    setLoading(true);
    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!alive) return;
        setData(result);
        setError(null);
      })
      .catch((err) => {
        if (!alive || err?.name === "AbortError") return;
        setError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, loading, reload, setData };
}

/* ---------------------------------------------------------------- Skeleton */

export function Skeleton({ className = "", rounded = "rounded-xl", style }) {
  return (
    <div
      style={style}
      className={`relative overflow-hidden ${rounded} ${className}
                  bg-[color-mix(in_oklab,var(--text)_8%,transparent)]`}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--text) 10%, transparent), transparent)",
          animation: "skeleton-sweep 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function SkeletonCard({ lines = 3, className = "" }) {
  return (
    <GlassCard hover={false} className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-2/3 mt-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 mt-2.5" style={{ width: `${90 - i * 18}%` }} />
      ))}
    </GlassCard>
  );
}

export function SkeletonGrid({ count = 6, lines = 2 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

export function SkeletonRings() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 place-items-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <Skeleton className="h-[132px] w-[132px]" rounded="rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 224 }) {
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {[55, 80, 35, 95, 60, 72, 45].map((h, i) => (
        <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- ApiError */

/** Shown when a screen cannot load. Distinguishes offline from DB problems. */
export function ApiErrorState({ error, onRetry, title }) {
  const msg = error?.message || "Something went wrong.";
  const offline = error?.status === 0;
  const dbIssue = error?.status === 503;
  const Icon = offline ? WifiOff : DatabaseZap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl py-12 px-6 text-center"
    >
      <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl bg-rose-500/12">
        <Icon size={24} className="text-rose-600 dark:text-rose-300" />
      </div>
      <h3 className="font-display text-lg font-semibold">
        {title || (offline ? "Server not reachable" : dbIssue ? "Database unavailable" : "Could not load")}
      </h3>
      <p className="text-dim text-sm mt-2 max-w-md mx-auto leading-relaxed">{msg}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
