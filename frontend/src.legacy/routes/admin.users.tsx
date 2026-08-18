import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GraduationCap, Plus, Search, ShieldCheck, Users, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, Card, EmptyState, Pill } from "@/components/app-shell";
import { useAppData, type AppUser } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersDirectoryPage,
});

const ROLE_SECTIONS: Array<{
  role: AppUser["role"];
  label: string;
  description: string;
  icon: typeof GraduationCap;
  tone: string;
  iconTone: string;
}> = [
  {
    role: "Student",
    label: "Students",
    description: "Learners enrolled in your department",
    icon: GraduationCap,
    tone: "border-violet/20 bg-violet/5",
    iconTone: "bg-violet/10 text-violet",
  },
  {
    role: "Faculty",
    label: "Faculty",
    description: "Teaching and academic support staff",
    icon: UserRound,
    tone: "border-gold/25 bg-gold/5",
    iconTone: "bg-gold/10 text-gold",
  },
  {
    role: "Admin",
    label: "Admins",
    description: "Department administrators and HODs",
    icon: ShieldCheck,
    tone: "border-teal-brand/20 bg-teal-brand/5",
    iconTone: "bg-teal-brand/10 text-teal-brand",
  },
];

function UsersDirectoryPage() {
  const { users } = useAppData();
  const { user: adminUser } = useAuth();
  const [search, setSearch] = useState("");
  const adminDepartment = adminUser?.departmentId?.toUpperCase();
  const isSuperAdmin = String(adminUser?.role ?? "").toLowerCase() === "super_admin";

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const sameDepartment =
        isSuperAdmin || !adminDepartment || user.departmentId === adminDepartment;
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return sameDepartment && matchesSearch;
    });
  }, [adminDepartment, isSuperAdmin, search, users]);

  const counts = ROLE_SECTIONS.map(({ role }) => ({
    role,
    count: visibleUsers.filter((user) => user.role === role).length,
  }));

  return (
    <div>
      <PageHeader
        title="Users Directory"
        subtitle={`${visibleUsers.length} visible users · ${adminDepartment ?? "All departments"} scope`}
        action={
          <Link
            to="/admin/users/add"
            className="inline-flex items-center gap-2 rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet/90"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        }
      />

      <Card className="mb-6 border-violet/15 bg-card/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet/10 text-violet">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Department directory</h2>
              <p className="text-sm text-muted-foreground">
                View-only directory. Account creation is handled on the Add User page.
              </p>
            </div>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search users by name or email"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/15"
            />
          </label>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {counts.map(({ role, count }) => {
            const section = ROLE_SECTIONS.find((item) => item.role === role)!;
            return (
              <div
                key={role}
                className="rounded-2xl border border-border bg-background/60 px-4 py-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </div>
                <div className="mt-1 text-2xl font-bold text-foreground">{count}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        {ROLE_SECTIONS.map(({ role, label, description, icon: Icon, tone, iconTone }) => {
          const sectionUsers = visibleUsers.filter((user) => user.role === role);
          return (
            <motion.section
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("rounded-3xl border p-4", tone)}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                      iconTone,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-foreground">{label}</h2>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Pill tone={role === "Student" ? "violet" : role === "Faculty" ? "gold" : "teal"}>
                  {sectionUsers.length}
                </Pill>
              </div>

              {sectionUsers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={`No ${label.toLowerCase()} found`}
                  description={
                    search
                      ? "Try a different search term."
                      : "No accounts are available in this scope."
                  }
                />
              ) : (
                <div className="space-y-2">
                  {sectionUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-3 py-3"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          iconTone,
                        )}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          user.status === "active" ? "bg-success" : "bg-muted-foreground/40",
                        )}
                        title={user.status === "active" ? "Active" : "Inactive"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
