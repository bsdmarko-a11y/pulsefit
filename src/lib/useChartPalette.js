import { useEffect, useState } from "react";

/**
 * Chart series colours per theme.
 *
 * Recharts paints strokes, legend labels and gradient stops with literal
 * colour strings, so they cannot inherit a CSS variable. The vivid dark-theme
 * hexes measure about 1.2:1 against the light background, which makes legend
 * text unreadable and lines nearly invisible, so light mode gets its own set.
 */
const DARK = {
  bench: "#bef264",
  squat: "#22d3ee",
  deadlift: "#a78bfa",
  area: "#22d3ee",
  barFrom: "#22d3ee",
  barTo: "#bef264",
};

const LIGHT = {
  bench: "#4d7c0f",
  squat: "#0e7490",
  deadlift: "#6d28d9",
  area: "#0e7490",
  barFrom: "#0e7490",
  barTo: "#4d7c0f",
};

const isDark = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("dark");

export function useChartPalette() {
  const [dark, setDark] = useState(isDark);

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setDark(el.classList.contains("dark")));
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark ? DARK : LIGHT;
}
