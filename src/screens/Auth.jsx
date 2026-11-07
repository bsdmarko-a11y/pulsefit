import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Target, Timer, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Logo, Button, Page, useToast } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Field({ icon: Icon, label, hint, ...input }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-dim">{label}</span>
      <div className="relative mt-1.5">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
        <input
          {...input}
          className="w-full rounded-xl pl-10 pr-3.5 py-3 text-sm outline-none transition-colors
                     bg-[color-mix(in_oklab,var(--text)_6%,transparent)]
                     border border-[color-mix(in_oklab,var(--text)_12%,transparent)]
                     placeholder:text-[var(--text-dim)]
                     focus:border-[color-mix(in_oklab,var(--accent)_60%,transparent)]"
        />
      </div>
      {hint && <span className="block text-[11px] text-dim mt-1.5">{hint}</span>}
    </label>
  );
}

function Shell({ title, subtitle, children, footer, onBack }) {
  return (
    <Page className="min-h-screen grid place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="mb-7 inline-flex items-center gap-2 text-sm text-dim
                                            hover:text-[var(--text)] transition-colors cursor-pointer">
          <ArrowLeft size={15} /> Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-3xl p-7 sm:p-9 relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full grad-bg opacity-20 blur-3xl" />
          <div className="relative">
            <Logo />
            <h1 className="font-display text-2xl font-bold tracking-tight mt-6">{title}</h1>
            <p className="text-dim text-sm mt-1.5">{subtitle}</p>
            {children}
          </div>
        </motion.div>

        <p className="text-center text-sm text-dim mt-6">{footer}</p>
      </div>
    </Page>
  );
}

const linkClass =
  "font-semibold text-[var(--accent)] hover:underline underline-offset-4 cursor-pointer";

/* -------------------------------------------------------------------- Login */

export function Login({ onNavigate }) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.fullName.split(" ")[0]}`, { desc: "Lets get to work." });
      onNavigate("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      onBack={() => onNavigate("landing")}
      footer={
        <>
          New here?{" "}
          <button className={linkClass} onClick={() => onNavigate("signup")}>
            Create an account
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field
          icon={Mail}
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          icon={Lock}
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}
                icon={busy ? undefined : ArrowRight}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </Shell>
  );
}

/* ------------------------------------------------------------------- Signup */

export function Signup({ onNavigate }) {
  const { signup } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    weeklyGoalWorkouts: 5,
    weeklyGoalMinutes: 400,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = await signup({
        ...form,
        weeklyGoalWorkouts: Number(form.weeklyGoalWorkouts),
        weeklyGoalMinutes: Number(form.weeklyGoalMinutes),
      });
      toast(`Welcome to PulseFit, ${user.fullName.split(" ")[0]}`, {
        desc: "Add some exercises from the library to build today's session.",
      });
      onNavigate("library");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell
      title="Create your account"
      subtitle="Set your weekly targets and start tracking."
      onBack={() => onNavigate("landing")}
      footer={
        <>
          Already training with us?{" "}
          <button className={linkClass} onClick={() => onNavigate("login")}>
            Sign in
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field
          icon={User}
          label="Your name"
          required
          autoComplete="name"
          placeholder="Alex Rivera"
          value={form.fullName}
          onChange={set("fullName")}
        />
        <Field
          icon={Mail}
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
        />
        <Field
          icon={Lock}
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="At least 8 characters."
          value={form.password}
          onChange={set("password")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={Target}
            label="Workouts / week"
            type="number"
            min={1}
            max={14}
            required
            value={form.weeklyGoalWorkouts}
            onChange={set("weeklyGoalWorkouts")}
          />
          <Field
            icon={Timer}
            label="Minutes / week"
            type="number"
            min={30}
            max={2000}
            step={10}
            required
            value={form.weeklyGoalMinutes}
            onChange={set("weeklyGoalMinutes")}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}
                icon={busy ? undefined : ArrowRight}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : "Create account"}
        </Button>
      </form>
    </Shell>
  );
}
