# PulseFit

A gym app for planning workouts, tracking progress, booking classes and keeping the streak alive.
Dark-first design with a lime→cyan accent, glassmorphism cards and motion throughout.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Stack

React 18 · Vite 6 · Tailwind CSS 4 · Framer Motion · Recharts · lucide-react · canvas-confetti

No backend. Everything comes from `src/data/mockData.js`.

## Screens

| Screen | What it does |
| --- | --- |
| **Landing** | Hero, animated counters, feature grid, quote of the day |
| **Dashboard** | Today's workout, three progress rings, weekly bar chart, streak, recent sessions |
| **Workout library** | 24 exercises, muscle-group filter, search, add-to-session toasts |
| **Live workout** | Circular rest timer, per-set tracking, live volume/kcal, confetti on finish |
| **Progress** | Strength lines, body-composition area chart, PR badges, lifetime totals |
| **Classes** | Weekly schedule, type filter, live spot counts, booking with toast |
| **Profile** | Membership card, lifetime stats, 8 achievements, preferences |

## Layout

```
src/
  components/
    ui.jsx        Logo, Button, GlassCard, ProgressRing, AnimatedCounter, Badge, toasts
    Shell.jsx     Sidebar (desktop), BottomNav (mobile), TopBar, ThemeToggle
  screens/        One file per screen
  data/
    mockData.js   All content: user, exercises, classes, PRs, charts, achievements
  App.jsx         Routing, theme state
  index.css       Design tokens, glass/gradient/glow utilities, light + dark themes
```

## Notes

- Theme is stored in `localStorage` under `pulsefit-theme`; dark is the default.
- Mount-time animations are used instead of viewport-triggered ones inside the app shell,
  so rings and counters always run when you land on a screen rather than waiting for a scroll.
- Accent colors carry a light-mode variant (`text-cyan-700 dark:text-cyan-300`) because the
  `-300` shades are unreadable on a light background.
- `prefers-reduced-motion` is respected globally.
