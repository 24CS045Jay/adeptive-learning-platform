import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useId } from "react";
import {
  GraduationCap,
  User,
  Users,
  Shield,
  Eye,
  EyeOff,
  Chrome,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Brain,
  ChartBar,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Sign in · AI Tutor" },
      { name: "description", content: "Sign in to AI Tutor — grounded academic tutoring for CSPIT CSE." },
      { property: "og:title", content: "Sign in · AI Tutor" },
      { property: "og:description", content: "Sign in to AI Tutor — grounded academic tutoring for CSPIT CSE." },
    ],
  }),
  component: LoginPage,
}));

// ─── Role config ────────────────────────────────────────────────────────────

const ROLES = [
  {
    key: "student" as Role,
    label: "Student",
    icon: User,
    headline: "Student Sign In",
    subtext: "Ask, learn, and quiz yourself.",
    accent: "#5b4bd6",
    accentLight: "rgba(91,75,214,0.12)",
    accentClass: "text-indigo-brand",
    btnClass: "bg-indigo-brand hover:bg-indigo-brand-hover",
    tabActive: "border-indigo-brand text-indigo-brand",
    placeholder: { email: "student@charusat.edu.in", password: "student123" },
  },
  {
    key: "faculty" as Role,
    label: "Faculty",
    icon: Users,
    headline: "Faculty Sign In",
    subtext: "Manage content and answer student queries.",
    accent: "#f0b429",
    accentLight: "rgba(240,180,41,0.15)",
    accentClass: "text-amber-brand",
    btnClass: "bg-amber-brand hover:bg-amber-500",
    tabActive: "border-amber-brand text-amber-brand",
    placeholder: { email: "faculty@charusat.edu.in", password: "faculty123" },
  },
  {
    key: "admin" as Role,
    label: "Admin",
    icon: Shield,
    headline: "Admin Sign In",
    subtext: "Operate the institution knowledge base.",
    accent: "#14b8a6",
    accentLight: "rgba(20,184,166,0.12)",
    accentClass: "text-teal-brand",
    btnClass: "bg-teal-brand hover:bg-teal-600",
    tabActive: "border-teal-brand text-teal-brand",
    placeholder: { email: "admin@charusat.edu.in", password: "admin123" },
  },
] as const;

type ViewMode = "login" | "register" | "forgot";

// ─── Main Page ───────────────────────────────────────────────────────────────

function LoginPage() {
  const [activeRole, setActiveRole] = useState<Role>("student");
  const [view, setView] = useState<ViewMode>("login");
  const roleConfig = ROLES.find((r) => r.key === activeRole)!;

  return (
    <div className="flex min-h-screen bg-canvas font-sans">
      {/* ── Left branding column ── */}
      <BrandingPanel activeRole={activeRole} />

      {/* ── Right form column ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy">
            <GraduationCap className="h-5 w-5 text-amber-brand" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-2xl font-bold text-navy">AI Tutor</div>
            <div className="text-[11px] text-slate-500">CSPIT CSE · RAG Platform</div>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-3xl bg-white px-8 py-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_20px_60px_-15px_rgba(30,27,60,0.12)]">
          {/* Role tabs */}
          <RoleTabs activeRole={activeRole} onSelect={setActiveRole} />

          {/* View switcher */}
          {view === "login" && (
            <LoginForm roleConfig={roleConfig} onForgot={() => setView("forgot")} onRegister={() => setView("register")} />
          )}
          {view === "register" && (
            <RegisterForm roleConfig={roleConfig} onBack={() => setView("login")} />
          )}
          {view === "forgot" && (
            <ForgotPasswordForm onBack={() => setView("login")} />
          )}
        </div>

        {/* Demo hint */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Demo credentials are pre-filled — just click <strong>Login</strong>.
        </p>
      </div>
    </div>
  );
}

// ─── Branding Panel ──────────────────────────────────────────────────────────

function BrandingPanel({ activeRole }: { activeRole: Role }) {
  const roleConfig = ROLES.find((r) => r.key === activeRole)!;
  const features = [
    { icon: Sparkles, text: "RAG-powered answers from your syllabus" },
    { icon: Brain,    text: "Adaptive difficulty based on your level" },
    { icon: BookOpen, text: "Multi-format document knowledge base" },
    { icon: ChartBar, text: "Progress analytics & weak topic detection" },
  ];
  return (
    <div
      className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden px-12 py-14 lg:flex"
      style={{ background: `linear-gradient(145deg, #1e1b3c 0%, #2d2a55 60%, ${roleConfig.accent}55 100%)` }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl transition-colors duration-700"
        style={{ background: roleConfig.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-15 blur-3xl transition-colors duration-700"
        style={{ background: roleConfig.accent }}
      />

      {/* Logo */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-brand/20">
            <GraduationCap className="h-6 w-6 text-amber-brand" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-2xl font-bold text-white">AI Tutor</div>
            <div className="text-[11px] text-slate-400">CSPIT CSE · RAG Platform</div>
          </div>
        </div>

        <h2 className="mt-12 font-serif text-3xl font-bold leading-snug text-white">
          Grounded answers.<br />Adaptive learning.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Every answer is grounded in your faculty's approved course material — not the open web.
        </p>

        {/* Feature list */}
        <ul className="mt-10 space-y-4">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-700"
                style={{ background: roleConfig.accentLight, color: roleConfig.accent }}
              >
                <Icon className="h-4 w-4" />
              </div>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom floating card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: roleConfig.accent }}>
          Currently active
        </div>
        <div className="mt-2 text-lg font-bold text-white">{ROLES.find(r=>r.key===activeRole)?.headline}</div>
        <div className="mt-1 text-sm text-slate-300">{ROLES.find(r=>r.key===activeRole)?.subtext}</div>
      </div>
    </div>
  );
}

// ─── Role Tabs ───────────────────────────────────────────────────────────────

function RoleTabs({ activeRole, onSelect }: { activeRole: Role; onSelect: (r: Role) => void }) {
  return (
    <div className="mb-8 flex rounded-2xl bg-slate-100 p-1">
      {ROLES.map((r) => {
        const Icon = r.icon;
        const isActive = activeRole === r.key;
        return (
          <button
            key={r.key}
            id={`role-tab-${r.key}`}
            type="button"
            onClick={() => onSelect(r.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white shadow-sm " + r.accentClass
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────

function LoginForm({
  roleConfig,
  onForgot,
  onRegister,
}: {
  roleConfig: (typeof ROLES)[number];
  onForgot: () => void;
  onRegister: () => void;
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const id = useId();

  const [email, setEmail] = useState(roleConfig.placeholder.email);
  const [password, setPassword] = useState(roleConfig.placeholder.password);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset pre-fill when role changes
  const currentPlaceholder = roleConfig.placeholder;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Small artificial delay for UX
    await new Promise((r) => setTimeout(r, 400));
    const result = login(roleConfig.key, email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      return;
    }
    navigate({ to: `/${roleConfig.key}` });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Headline */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-slate-900">{roleConfig.headline}</h1>
        <p className="mt-1 text-sm text-slate-500">{roleConfig.subtext}</p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span className="mt-0.5 text-base">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={() => setError("Google sign-in is not available in the demo.")}
        className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <Chrome className="h-4 w-4" />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-5 flex items-center gap-3">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs text-slate-400">Or with</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={currentPlaceholder.email}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
          style={{ "--tw-ring-color": roleConfig.accent + "40" } as React.CSSProperties}
          required
        />
      </div>

      {/* Password */}
      <div className="mb-2">
        <label htmlFor={`${id}-password`} className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id={`${id}-password`}
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
            style={{ "--tw-ring-color": roleConfig.accent + "40" } as React.CSSProperties}
            required
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Forgot link */}
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={onForgot}
          className={cn("text-xs font-medium transition hover:underline", roleConfig.accentClass)}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        id={`login-btn-${roleConfig.key}`}
        type="submit"
        disabled={loading}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:opacity-60",
          roleConfig.btnClass,
        )}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {loading ? "Signing in…" : "Login"}
      </button>

      {/* Register link */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          className={cn("font-medium transition hover:underline", roleConfig.accentClass)}
        >
          Register
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ───────────────────────────────────────────────────────────

function RegisterForm({
  roleConfig,
  onBack,
}: {
  roleConfig: (typeof ROLES)[number];
  onBack: () => void;
}) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const id = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) { setError("Passwords do not match."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = register(name, email.trim(), password, roleConfig.key);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Registration failed."); return; }
    navigate({ to: `/${roleConfig.key}` });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-0.5 text-sm text-slate-500">{roleConfig.label} registration</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
        <input id={`${id}-name`} type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aarav Patel" required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor={`${id}-reg-email`} className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
        <input id={`${id}-reg-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@charusat.edu.in" required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label htmlFor={`${id}-reg-pw`} className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <input id={`${id}-reg-pw`} type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters" required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
          />
          <button type="button" onClick={() => setShowPw(v => !v)} aria-label="Toggle password"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="mb-6">
        <label htmlFor={`${id}-confirm-pw`} className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</label>
        <input id={`${id}-confirm-pw`} type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Re-enter password" required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-offset-0"
        />
      </div>

      <button type="submit" disabled={loading}
        className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-60", roleConfig.btnClass)}
      >
        {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onBack} className={cn("font-medium transition hover:underline", roleConfig.accentClass)}>
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const { sendPasswordReset } = useAuth();
  const id = useId();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = sendPasswordReset(email.trim());
    setLoading(false);
    if (!result.ok) { setError(result.error ?? "Error sending reset link."); return; }
    setSent(true);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Forgot password?</h1>
          <p className="mt-0.5 text-sm text-slate-500">We'll send a reset link to your email.</p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 text-center">
          <div className="text-2xl">📬</div>
          <div className="mt-3 font-semibold text-slate-900">Reset link sent!</div>
          <p className="mt-1 text-sm text-slate-500">Check your inbox at <strong>{email}</strong>.</p>
          <p className="mt-1 text-xs text-slate-400">(Demo — no email is actually sent.)</p>
          <button type="button" onClick={onBack} className="mt-5 text-sm font-medium text-indigo-brand hover:underline">
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          <div className="mb-6">
            <label htmlFor={`${id}-reset-email`} className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input id={`${id}-reset-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@charusat.edu.in" required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-300"
            />
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-brand py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-brand-hover disabled:opacity-60"
          >
            {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            Remembered it?{" "}
            <button type="button" onClick={onBack} className="font-medium text-indigo-brand hover:underline">Back to login</button>
          </p>
        </form>
      )}
    </div>
  );
}
