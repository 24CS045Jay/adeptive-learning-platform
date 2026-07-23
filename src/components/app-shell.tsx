import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LogOut, type LucideIcon } from "lucide-react";
import type { Role } from "@/lib/mock-data";
import { currentUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function AppShell({ role, nav }: { role: Role; nav: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = currentUsers[role];

  return (
    <div className="flex min-h-screen bg-canvas font-sans text-slate-900">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-navy text-slate-200">
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-brand/15">
              <GraduationCap className="h-5 w-5 text-amber-brand" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-xl font-bold text-white">AI Tutor</div>
              <div className="text-[11px] text-slate-400">CSPIT CSE · RAG Platform</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-navy-active font-semibold text-white"
                    : "text-slate-300 hover:bg-navy-hover hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mx-4 mt-4 border-t border-white/10 px-2 pt-4 pb-6">
          <div className="text-sm font-semibold text-white">{user.name}</div>
          <div className="text-[11px] text-slate-400">
            {user.role} · {user.email}
          </div>
          <Link
            to="/"
            className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </aside>
      <main className="ml-64 flex-1 px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const statColors: Record<string, string> = {
  indigo: "text-indigo-brand",
  amber: "text-amber-brand",
  green: "text-green-brand",
  teal: "text-teal-brand",
  navy: "text-navy",
  red: "text-red-brand",
};

export function StatCard({
  label,
  value,
  caption,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  caption?: string;
  color?: keyof typeof statColors;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={cn("mt-3 text-4xl font-bold", statColors[color])}>{value}</div>
      {caption && <div className="mt-2 text-xs text-slate-500">{caption}</div>}
    </div>
  );
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  color = "indigo",
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "indigo" | "amber" | "green" | "teal";
  onClick?: () => void;
}) {
  const bg: Record<string, string> = {
    indigo: "bg-indigo-brand/10 text-indigo-brand",
    amber: "bg-amber-brand/15 text-amber-brand",
    green: "bg-green-brand/10 text-green-brand",
    teal: "bg-teal-brand/10 text-teal-brand",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-2xl bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bg[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      </div>
    </button>
  );
}

export function Card({ title, children, action }: { title?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <div className="font-serif text-lg font-bold text-slate-900">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

type Tone = "green" | "amber" | "red" | "indigo" | "slate";
const toneClass: Record<Tone, string> = {
  green: "bg-green-brand/12 text-green-700",
  amber: "bg-amber-brand/20 text-amber-700",
  red: "bg-red-brand/12 text-red-700",
  indigo: "bg-indigo-brand/12 text-indigo-brand",
  slate: "bg-slate-200 text-slate-700",
};
export function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", toneClass[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function PrimaryButton({ children, onClick, icon: Icon, type = "button" }: { children: React.ReactNode; onClick?: () => void; icon?: LucideIcon; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-indigo-brand px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-brand-hover"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function statusTone(status: string): Tone {
  if (status === "approved" || status === "active" || status === "resolved") return "green";
  if (status === "pending" || status === "open") return "amber";
  if (status === "rejected" || status === "inactive") return "red";
  return "slate";
}