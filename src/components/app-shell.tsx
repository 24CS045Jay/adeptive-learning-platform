import { useState } from "react";
import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  GraduationCap, LogOut, Bell, Sun, Moon,
  MessageSquare, Search, ChevronDown, TrendingUp, TrendingDown,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/mock-data";
import { currentUsers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/lib/app-data-context";
import { useTheme } from "@/hooks/use-theme";
import { useCountUp } from "@/hooks/use-count-up";

export type NavItem = { to: string; label: string; icon: LucideIcon };

/* ─────────────────────────────────────────────────
   APP SHELL — shared layout for all roles
───────────────────────────────────────────────── */
export function AppShell({ role, nav }: { role: Role; nav: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { notifications, markNotificationsAsRead } = useAppData();
  const { isDark, toggle } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const mockUser = currentUsers[role];
  const displayName = authUser?.name ?? mockUser.name;
  const displayEmail = authUser?.email ?? mockUser.email;
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const activeNav = nav.find(
    (item) => pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to))
  );
  const pageTitle = activeNav?.label ?? (role === "admin" ? "Overview" : role === "faculty" ? "Dashboard" : "Dashboard");

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* ── Sidebar ── */}
      <aside className="sidebar-gradient fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border shadow-xl transition-colors">
        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet/15 ring-1 ring-violet/25 shadow-[0_0_12px_-2px_oklch(0.62_0.22_293_/_30%)]">
              <GraduationCap className="h-5 w-5 text-violet" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-xl font-bold text-foreground">AI Tutor</div>
              <div className="text-[11px] text-muted-foreground">CSPIT CSE · RAG Platform</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <LayoutGroup>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-violet/12 ring-1 ring-violet/20"
                      style={{ boxShadow: "inset 3px 0 0 var(--color-violet), 0 0 12px -3px oklch(0.62 0.22 293 / 18%)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative z-10 h-4 w-4 shrink-0 transition-all duration-200",
                      active ? "text-violet" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "relative z-10 transition-colors",
                      active ? "font-semibold text-violet" : "text-sidebar-foreground group-hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* User card at bottom */}
        <div className="mx-3 mt-auto border-t border-border px-1 pt-4 pb-5">
          <Link
            to={`/${role}/profile`}
            className="group flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-accent"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet/20 text-xs font-bold text-violet avatar-ring-violet">
              {initials}
              <span className="online-dot absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground group-hover:text-violet transition-colors">{displayName}</div>
              <div className="truncate text-[11px] text-muted-foreground">{displayEmail}</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="ml-64 flex min-w-0 flex-1 flex-col">
        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-8 py-3.5 backdrop-blur-md transition-colors">
          {/* Left — page title */}
          <div>
            <h2 className="text-base font-semibold text-foreground">{pageTitle}</h2>
            <p className="text-[11px] text-muted-foreground">CSPIT CSE Adaptive Learning</p>
          </div>

          {/* Right — controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="group hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-sm transition-all duration-200 focus-within:border-violet/40 focus-within:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] md:flex">
              <Search className="h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-violet" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Quick search…"
                className="w-36 bg-transparent text-sm outline-none placeholder:text-muted-foreground transition-all focus:w-48"
              />
            </div>

            {/* Messages icon */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-violet/30 hover:text-violet hover:shadow-[0_0_12px_-3px_oklch(0.62_0.22_293_/_25%)]"
              title="Messages"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="badge-pulse absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet text-[9px] font-bold text-white">
                2
              </span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-violet/30 hover:text-violet hover:shadow-[0_0_12px_-3px_oklch(0.62_0.22_293_/_25%)]"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="badge-pulse absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl z-50 space-y-3"
                    style={{ boxShadow: "0 16px 48px -12px rgba(0,0,0,0.35), 0 0 0 1px var(--color-border)" }}
                  >
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                        <Bell className="h-3.5 w-3.5 text-violet" /> Notifications ({notifications.length})
                      </div>
                      {unreadCount > 0 && (
                        <button type="button" onClick={markNotificationsAsRead} className="text-[11px] font-medium text-violet hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-4 text-center text-xs text-muted-foreground">No notifications yet.</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={cn("rounded-xl border p-2.5 text-xs transition", n.read ? "border-border bg-muted/40 opacity-75" : "border-violet/20 bg-violet/5 font-medium")}>
                            <div className="flex justify-between font-bold text-foreground">
                              <span>{n.title}</span>
                              <span className="text-[10px] font-normal text-muted-foreground">{n.timestamp}</span>
                            </div>
                            <p className="mt-1 text-muted-foreground leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-border pt-2 text-center">
                      <button type="button" onClick={() => setShowNotifications(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle — pill style */}
            <button
              type="button"
              onClick={toggle}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle-pill"
              aria-label="Toggle theme"
            >
              {/* Sun icon track-left */}
              <span className={cn("absolute left-2 flex h-5 w-5 items-center justify-center transition-opacity duration-200", isDark ? "opacity-30" : "opacity-0")}>
                <Sun className="h-3.5 w-3.5 text-gold" />
              </span>
              {/* Moon icon track-right */}
              <span className={cn("absolute right-2 flex h-5 w-5 items-center justify-center transition-opacity duration-200", !isDark ? "opacity-30" : "opacity-0")}>
                <Moon className="h-3.5 w-3.5 text-violet" />
              </span>
              <span className={cn("theme-toggle-thumb", isDark ? "is-dark" : "is-light")}>
                <AnimatePresence mode="wait" initial={false}>
                  {isDark ? (
                    <motion.span key="sun" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Sun className="h-3.5 w-3.5 text-white" />
                    </motion.span>
                  ) : (
                    <motion.span key="moon" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Moon className="h-3.5 w-3.5 text-white" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>

            {/* User avatar + dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false); }}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-1.5 transition-all hover:border-violet/30 hover:shadow-[0_0_10px_-3px_oklch(0.62_0.22_293_/_20%)]"
              >
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet/30 to-violet/10 text-[11px] font-bold text-violet ring-1 ring-violet/30">
                  {initials}
                </div>
                <span className="hidden text-xs font-semibold text-foreground sm:block">{displayName.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card py-1.5 shadow-xl z-50"
                    style={{ boxShadow: "0 16px 48px -12px rgba(0,0,0,0.3), 0 0 0 1px var(--color-border)" }}
                  >
                    {[
                      { label: "Profile", to: `/${role}/profile` },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowUserMenu(false)}
                        className="flex w-full items-center px-3 py-2 text-sm text-foreground transition hover:bg-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger transition hover:bg-accent"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page Content with transition ── */}
        <main className="flex-1 px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PAGE HEADER
───────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-8 flex items-start justify-between gap-4"
    >
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   CARD — with variant support
───────────────────────────────────────────────── */
export function Card({
  title,
  children,
  action,
  className,
  variant = "default",
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "hero" | "glow" | "hero-gold";
}) {
  const variantClasses = {
    default: "rounded-2xl border border-border bg-card p-6",
    hero: "card-hero rounded-2xl border p-6",
    glow: "card-glow rounded-2xl border border-border bg-card p-6",
    "hero-gold": "card-hero-gold rounded-2xl border p-6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3, boxShadow: "0 12px 40px -10px oklch(0.62 0.22 293 / 22%), 0 0 0 1px oklch(0.62 0.22 293 / 12%)" }}
      className={cn(
        variantClasses[variant],
        "transition-all duration-200",
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <div className="font-serif text-lg font-bold text-foreground">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   STAT CARD — with count-up, trend, gradient number
───────────────────────────────────────────────── */
type StatColor = "violet" | "gold" | "success" | "danger" | "indigo" | "amber" | "green" | "teal" | "navy" | "red";

interface StatCardProps {
  label: string;
  value: string | number;
  caption?: string;
  color?: StatColor;
  icon?: LucideIcon;
  trend?: { pct: number; up: boolean };
  sparklineData?: number[];
}

const STAT_COLOR_MAP: Record<StatColor, { text: string; bg: string; glow: string; gradient: string }> = {
  violet: { text: "text-violet",      bg: "bg-violet/10",       glow: "glow-violet",   gradient: "text-gradient-violet" },
  gold:   { text: "text-gold",        bg: "bg-gold/10",         glow: "glow-gold",     gradient: "text-gradient-gold" },
  success:{ text: "text-success",     bg: "bg-success/10",      glow: "glow-success",  gradient: "text-gradient-success" },
  danger: { text: "text-danger",      bg: "bg-danger/10",       glow: "",              gradient: "" },
  indigo: { text: "text-violet",      bg: "bg-violet/10",       glow: "glow-violet",   gradient: "text-gradient-violet" },
  amber:  { text: "text-gold",        bg: "bg-gold/10",         glow: "glow-gold",     gradient: "text-gradient-gold" },
  green:  { text: "text-success",     bg: "bg-success/10",      glow: "glow-success",  gradient: "text-gradient-success" },
  teal:   { text: "text-teal-brand",  bg: "bg-teal-brand/10",   glow: "",              gradient: "" },
  navy:   { text: "text-foreground",  bg: "bg-muted",           glow: "",              gradient: "" },
  red:    { text: "text-danger",      bg: "bg-danger/10",       glow: "",              gradient: "" },
};

export function StatCard({ label, value, caption, color = "violet", icon: Icon, trend, sparklineData }: StatCardProps) {
  const colors = STAT_COLOR_MAP[color] ?? STAT_COLOR_MAP.violet;
  const numericValue = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  const isNumeric = typeof value === "number" || /^\d+$/.test(String(value));
  const { count, containerRef } = useCountUp(numericValue, 700);

  return (
    <motion.div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -3 }}
      className="glow-hover-violet rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, boxShadow: "0 0 16px -2px oklch(0.62 0.22 293 / 45%)" }}
            transition={{ duration: 0.15 }}
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200", colors.bg)}
          >
            <Icon className={cn("h-5 w-5", colors.text)} />
          </motion.div>
        )}
      </div>
      <div className={cn("mt-3 text-4xl font-bold tabular-nums", colors.gradient || colors.text)}>
        {isNumeric ? count.toLocaleString() : value}
        {typeof value === "string" && value.endsWith("%") ? "%" : ""}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.2 }}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
              trend.up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}
          >
            {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.pct}% vs last week
          </motion.span>
        )}
        {caption && <div className="text-xs text-muted-foreground">{caption}</div>}
      </div>
      {/* Sparkline mini bars */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 flex h-8 items-end gap-0.5">
          {sparklineData.map((v, i) => {
            const max = Math.max(...sparklineData);
            const pct = max > 0 ? (v / max) * 100 : 0;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.4, ease: "easeOut" }}
                className={cn("flex-1 rounded-sm", colors.bg)}
                style={{ minHeight: 3 }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   ACTION CARD — icon-in-glow-badge with color strip
───────────────────────────────────────────────── */
export function ActionCard({
  icon: Icon,
  title,
  description,
  color = "violet",
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "indigo" | "amber" | "green" | "teal" | "violet" | "gold";
  onClick?: () => void;
}) {
  const colorMap: Record<string, { bg: string; text: string; strip: string; border: string; glow: string }> = {
    violet: { bg: "bg-violet/10", text: "text-violet", strip: "from-violet to-violet/60",   border: "hover:border-violet/30",   glow: "0 0 20px -3px oklch(0.62 0.22 293 / 40%)" },
    indigo: { bg: "bg-violet/10", text: "text-violet", strip: "from-violet to-violet/60",   border: "hover:border-violet/30",   glow: "0 0 20px -3px oklch(0.62 0.22 293 / 40%)" },
    gold:   { bg: "bg-gold/10",   text: "text-gold",   strip: "from-gold to-gold/60",       border: "hover:border-gold/30",     glow: "0 0 20px -3px oklch(0.82 0.18 84 / 40%)" },
    amber:  { bg: "bg-gold/10",   text: "text-gold",   strip: "from-gold to-gold/60",       border: "hover:border-gold/30",     glow: "0 0 20px -3px oklch(0.82 0.18 84 / 40%)" },
    green:  { bg: "bg-success/10",text: "text-success",strip: "from-success to-success/60", border: "hover:border-success/30",  glow: "0 0 20px -3px oklch(0.75 0.17 160 / 40%)" },
    teal:   { bg: "bg-teal-brand/10", text: "text-teal-brand", strip: "from-teal-brand to-teal-brand/60", border: "hover:border-teal-brand/30", glow: "" },
  };
  const c = colorMap[color] ?? colorMap.violet;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:shadow-lg",
        c.border
      )}
    >
      {/* Color accent top strip */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300", c.strip)} />

      <motion.div
        whileHover={{ boxShadow: c.glow }}
        className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-200", c.bg)}
      >
        <Icon className={cn("h-5 w-5", c.text)} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-foreground">{title}</div>
          <ArrowRight className={cn("h-4 w-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100", c.text)} />
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────
   PILL — status badge
───────────────────────────────────────────────── */
type PillTone = "indigo" | "amber" | "green" | "teal" | "navy" | "slate" | "red" | "violet" | "gold" | "success" | "danger";

const PILL_STYLES: Record<PillTone, string> = {
  violet:  "bg-violet/10 text-violet",
  indigo:  "bg-violet/10 text-violet",
  gold:    "bg-gold/10 text-gold dark:text-gold",
  amber:   "bg-gold/10 text-gold dark:text-gold",
  success: "bg-success/10 text-success",
  green:   "bg-success/10 text-success",
  danger:  "bg-danger/10 text-danger",
  red:     "bg-danger/10 text-danger",
  teal:    "bg-teal-brand/10 text-teal-brand",
  navy:    "bg-foreground/10 text-foreground",
  slate:   "bg-muted text-muted-foreground",
};

export function Pill({ tone, children }: { tone: PillTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", PILL_STYLES[tone])}>
      {children}
    </span>
  );
}

export function statusTone(status: string): "success" | "gold" | "danger" | "slate" {
  switch (status) {
    case "approved":
    case "active":
      return "success";
    case "pending":
      return "gold";
    case "rejected":
    case "inactive":
      return "danger";
    default:
      return "slate";
  }
}

/* ─────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-3 font-semibold text-foreground">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   PRIMARY BUTTON — gradient fill + shimmer
───────────────────────────────────────────────── */
export function PrimaryButton({
  children,
  icon: Icon,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ boxShadow: "0 0 22px -4px oklch(0.62 0.22 293 / 55%)" }}
      whileTap={{ scale: 0.95 }}
      className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 hover:from-[#9d72f7] hover:to-[#8b5cf6]"
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────
   SKELETON CARD — moving shimmer
───────────────────────────────────────────────── */
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
      <div className="skeleton h-5 w-32" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${60 + (i * 13) % 35}%` }} />
      ))}
    </div>
  );
}