import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { ToastProvider } from "./components/ui.jsx";
import { Sidebar, BottomNav, TopBar, NAV } from "./components/Shell.jsx";
import Landing from "./screens/Landing.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Library from "./screens/Library.jsx";
import LiveWorkout from "./screens/LiveWorkout.jsx";
import Progress from "./screens/Progress.jsx";
import Classes from "./screens/Classes.jsx";
import Profile from "./screens/Profile.jsx";
import { todaysWorkout, user } from "./data/mockData.js";

const TITLES = {
  dashboard: { title: "Dashboard", subtitle: `Week of training · ${user.streak}-day streak alive` },
  library: { title: "Workout library", subtitle: "24 movements, six muscle groups" },
  live: { title: "Live workout", subtitle: todaysWorkout.title },
  progress: { title: "Progress", subtitle: "Strength, body metrics and personal records" },
  classes: { title: "Class booking", subtitle: "Yoga · HIIT · Spin · Boxing" },
  profile: { title: "Profile", subtitle: `${user.membership} member since ${user.memberSince}` },
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("pulsefit-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("pulsefit-theme", theme);
    } catch {
      /* storage blocked — theme still applies for this visit */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return [theme, toggle];
}

export default function App() {
  const [route, setRoute] = useState("landing");
  const [theme, toggleTheme] = useTheme();

  const navigate = useCallback((next) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const isApp = route !== "landing";
  const meta = TITLES[route] ?? TITLES.dashboard;

  const screens = {
    dashboard: <Dashboard key="dashboard" onNavigate={navigate} />,
    library: <Library key="library" onNavigate={navigate} />,
    live: <LiveWorkout key="live" onNavigate={navigate} />,
    progress: <Progress key="progress" />,
    classes: <Classes key="classes" />,
    profile: <Profile key="profile" onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />,
  };

  return (
    <ToastProvider>
      {!isApp ? (
        <AnimatePresence mode="wait">
          <Landing key="landing" onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
        </AnimatePresence>
      ) : (
        <div className="min-h-screen">
          <Sidebar active={route} onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
          <main className="lg:pl-[244px]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-28 lg:pb-14">
              <TopBar
                title={meta.title}
                subtitle={meta.subtitle}
                theme={theme}
                onToggleTheme={toggleTheme}
                onNavigate={navigate}
              />
              <AnimatePresence mode="wait">{screens[route]}</AnimatePresence>
            </div>
          </main>
          <BottomNav active={route} onNavigate={navigate} />
        </div>
      )}
    </ToastProvider>
  );
}
