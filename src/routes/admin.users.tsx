import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserCheck, UserX, Search, KeyRound, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  Student: { text: "text-violet", bg: "bg-violet/10", ring: "avatar-ring-violet" },
  Faculty: { text: "text-gold", bg: "bg-gold/10", ring: "avatar-ring-gold" },
  Admin: { text: "text-teal-brand", bg: "bg-teal-brand/10", ring: "avatar-ring-teal" },
};

function UsersPage() {
  const { users, removeUser, toggleUserStatus } = useAppData();
  const { user: adminUser } = useAuth();
  const adminDepartment = adminUser?.departmentId?.toUpperCase();
  const isSuperAdmin = String(adminUser?.role ?? "").toLowerCase() === "super_admin";

  const [search, setSearch] = useState("");
  const [directoryRole, setDirectoryRole] = useState<"all" | "Student" | "Faculty" | "Admin">(
    "all",
  );

  const filtered = users.filter((u) => {
    const sameDepartment = isSuperAdmin || !adminDepartment || u.departmentId === adminDepartment;
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchDirectoryRole = directoryRole === "all" || u.role === directoryRole;
    return sameDepartment && matchSearch && matchDirectoryRole;
  });

  return (
    <div>
      <PageHeader
        title="User Administration"
        subtitle={`${filtered.length} visible accounts · ${adminDepartment ?? "All departments"} scope`}
        action={
          <Link
            to="/admin/users/add"
            className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#9d72f7] hover:to-[#8b5cf6]"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        }
      />

      {/* Directory zone */}
      <section className="rounded-3xl border border-border bg-card/70 p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-brand">
              Department directory
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-foreground">Browse accounts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and manage only the accounts available to your department scope.
            </p>
          </div>
          <div className="flex rounded-2xl border border-border bg-background/70 p-1">
            {["all", "Student", "Faculty", "Admin"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setDirectoryRole(role as typeof directoryRole)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                  directoryRole === role
                    ? "bg-violet text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {role === "all" ? "All" : `${role}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-violet/40 focus-within:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_10%)]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filtered.length} account{filtered.length === 1 ? "" : "s"} in this view
            </span>
            <span className="rounded-full bg-teal-brand/10 px-2.5 py-1 font-semibold text-teal-brand">
              {adminDepartment ?? "Global scope"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Password Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const rc = ROLE_COLORS[u.role] ?? {
                    text: "text-foreground",
                    bg: "bg-muted",
                    ring: "",
                  };
                  const isDefault = u.passwordStatus === "default";
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03, duration: 0.15 }}
                      className={cn(
                        "border-t border-border transition hover:bg-accent/40",
                        idx % 2 === 0 ? "" : "bg-muted/20",
                      )}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                rc.bg,
                                rc.text,
                                rc.ring,
                              )}
                            >
                              {u.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            {u.status === "active" && (
                              <span className="online-dot absolute -bottom-0.5 -right-0.5" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            rc.bg,
                            rc.text,
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 pr-4">
                        <Pill tone={statusTone(u.status)}>{u.status}</Pill>
                      </td>
                      <td className="py-3 pr-4">
                        {isDefault ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                            <KeyRound className="h-3 w-3" />
                            Default (not changed)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            Changed by user
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{u.joinedAt}</td>
                      <td className="py-3">
                        <div className="flex gap-2 text-muted-foreground">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            title={u.status === "active" ? "Deactivate user" : "Activate user"}
                            className={cn(
                              "rounded-lg p-1.5 transition hover:bg-accent hover:text-gold",
                              u.status === "inactive" && "text-gold",
                            )}
                          >
                            {u.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => removeUser(u.id)}
                            title="Remove user"
                            className="rounded-lg p-1.5 transition hover:bg-accent hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No users match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
