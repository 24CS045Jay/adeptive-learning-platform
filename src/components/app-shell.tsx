import { useState } from "react";
import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  GraduationCap, LogOut, UserCircle, Bell, CheckCircle2,
  AlertCircle, Megaphone, Check, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/mock-data";
import { currentUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data-context";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function AppShell({ role, nav }: { role: Role; nav: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { notifications, markNotificationsAsRead } = useAppData();

  const [showNotifications, setShowNotifications] = useState(false);

  const mockUser = currentUsers[role];
  const displayName = authUser?.name ?? mockUser.name;
  const displayEmail = authUser?.email ?? mockUser.email;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-canvas font-sans text-slate-900">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-navy text-slate-200 shadow-xl z-20">
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

        <nav className="flex-1 space-y-1 px-3 max-h-[calc(100vh-180px)] overflow-y-auto">
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
                    ? "bg-navy-active font-semibold text-white shadow-xs"
                    : "text-slate-300 hover:bg-navy-hover hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mt-auto border-t border-white/10 px-2 pt-4 pb-6">
          <Link
            to={`/${role}/profile`}
            className="group flex items-center gap-2.5 rounded-lg px-1 py-1 transition hover:bg-navy-hover"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
              {displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white group-hover:underline">{displayName}</div>
              <div className="truncate text-[11px] text-slate-400">{displayEmail}</div>
            </div>
            <UserCircle className="ml-auto h-4 w-4 shrink-0 text-slate-500" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="ml-64 flex-1 flex flex-col min-w-0">

        {/* Top Header Bar (Notifications & Role Badge) */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-10 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-brand/10 px-3 py-1 text-xs font-bold text-indigo-brand capitalize">
              {role} Portal
            </span>
            <span className="text-xs text-slate-400">CSPIT CSE Adaptive Learning Environment</span>
          </div>

          {/* Bell Icon & Notification Drawer Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications((v) => !v)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-indigo-brand/40 hover:bg-slate-50 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-indigo-brand" /> Notifications ({notifications.length})
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markNotificationsAsRead()}
                      className="text-[11px] font-medium text-indigo-brand hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "rounded-xl border p-2.5 text-xs transition",
                          n.read ? "border-slate-100 bg-slate-50 opacity-75" : "border-indigo-brand/20 bg-indigo-brand/5 font-medium"
                        )}
                      >
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-slate-600 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Close Drawer
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>
      </div>
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

export function StatCard({
  label,
  value,
  caption,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  caption?: string;
  color?: "indigo" | "amber" | "green" | "teal" | "navy" | "red";
}) {
  const statColors: Record<string, string> = {
    indigo: "text-indigo-brand",
    amber: "text-amber-brand",
    green: "text-green-brand",
    teal: "text-teal-brand",
    navy: "text-navy",
    red: "text-red-brand",
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={cn("mt-3 text-4xl font-bold", statColors[color])}>{value}</div>
      {caption && <div className="mt-2 text-xs text-slate-500 font-medium">{caption}</div>}
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

export function Card({ title, children, action, className }: { title?: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]", className)}>
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

export function Pill({ tone, children }: { tone: "indigo" | "amber" | "green" | "teal" | "navy" | "slate" | "red"; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    indigo: "bg-indigo-brand/10 text-indigo-brand",
    amber: "bg-amber-brand/15 text-amber-700",
    green: "bg-green-brand/10 text-green-700",
    teal: "bg-teal-brand/10 text-teal-brand",
    navy: "bg-navy text-white",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-brand/10 text-red-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", styles[tone])}>
      {children}
    </span>
  );
}

export function statusTone(status: string): "indigo" | "amber" | "green" | "red" | "slate" {
  switch (status) {
    case "approved":
    case "active":
      return "green";
    case "pending":
      return "amber";
    case "rejected":
    case "inactive":
      return "red";
    default:
      return "slate";
  }
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-3 font-semibold text-slate-800">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PrimaryButton({
  children,
  icon: Icon,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-brand-hover active:translate-y-0"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}