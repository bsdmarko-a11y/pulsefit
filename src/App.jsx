import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ToastProvider, Logo } from "./components/ui.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Sidebar, BottomNav, TopBar } from "./components/Shell.jsx";
import Landing from "./screens/Landing.jsx";
import { Login, Signup } from "./screens/Auth.jsx";
import Dashboard from "./screens/Dashboard.jsx";
import Library from "./screens/Library.jsx";
import LiveWorkout from "./screens/LiveWorkout.jsx";
import Progress from "./screens/Progress.jsx";
import Classes from "./screens/Classes.jsx";
import Profile from "./screens/Profile.jsx";

const PUBLIC = ["landing", "login", "signup"];
const PROTECTED = ["dashboard", "library", "live", "progress", "classes", "profile"];

const TITLES = {
  dashboard: { title: "Dashboard", subtitle: "Your week at a glance" },
  library: { title: "Workout library", subtitle: "Build today's session" },
  live: { title: "Live workout", subtitle: "Tick sets as you go" },
  progress: { title: "Progress", subtitle: "Strength, body metrics and records" },
  classes: { title: "Class booking", subtitle: "This week's schedule" },
  profile: { title: "Profile", subtitle: "Your account and achievements" },
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
      /* storage blocked - theme still applies for this visit */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return [theme, toggle];
}

function Booting() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <Logo size="lg" />
        <Loader2 size={20} className="mx-auto mt-6 animate-spin text-[var(--accent)]" />
      </div>
    </div>
  );
}

function Router() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState("landing");
  const [theme, toggleTheme] = useTheme();

  const navigate = useCallback((next) => {
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  /* Signing out from a protected screen lands you back on the landing page. */
  useEffect(() => {
    if (!loading && !user && PROTECTED.includes(route)) {
      setRoute("login");
    }
  }, [user, loading, route]);

  if (loading) return <Booting />;

  if (PUBLIC.includes(route) || !user) {
    const page =
      route === "login" ? (
        <Login key="login" onNavigate={navigate} />
      ) : route === "signup" ? (
        <Signup key="signup" onNavigate={navigate} />
      ) : (
        <Landing key="landing" onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
      );
    return <AnimatePresence mode="wait">{page}</AnimatePresence>;
  }

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
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  );
}
