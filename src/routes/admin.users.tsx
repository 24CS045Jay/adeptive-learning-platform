import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserCheck, UserX, Search, CheckCircle2, KeyRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { createUserWithDefaultPassword } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const DEPARTMENTS = [
  { code: "CE", label: "Computer Engineering" },
  { code: "CSE", label: "Computer Science & Engineering" },
  { code: "IT", label: "Information Technology" },
  { code: "EC", label: "Electronics & Communication" },
  { code: "AIML", label: "AI & Machine Learning" },
];

const ROLE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  Student: { text: "text-violet", bg: "bg-violet/10", ring: "avatar-ring-violet" },
  Faculty: { text: "text-gold", bg: "bg-gold/10", ring: "avatar-ring-gold" },
  Admin: { text: "text-teal-brand", bg: "bg-teal-brand/10", ring: "avatar-ring-teal" },
};

// ── Confirmation Toast ────────────────────────────────────────────────────────
function ConfirmToast({ email, onDismiss }: { email: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="mb-5 flex items-start gap-3 rounded-2xl border border-success/30 bg-success/8 p-4"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      <div className="flex-1 text-sm">
        <div className="font-semibold text-foreground">Account created</div>
        <p className="mt-0.5 text-muted-foreground">
          Account created for <strong>{email}</strong>. Default password:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
            password1234
          </code>{" "}
          — the user must change this on first login.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function UsersPage() {
  const { users, addUser, removeUser, toggleUserStatus } = useAppData();
  const { user: adminUser } = useAuth();
  const adminDepartment = adminUser?.departmentId?.toUpperCase();
  const isSuperAdmin = String(adminUser?.role ?? "").toLowerCase() === "super_admin";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [directoryRole, setDirectoryRole] = useState<"all" | "Student" | "Faculty" | "Admin">(
    "all",
  );
  const [showAdd, setShowAdd] = useState(false);
  const [toastEmail, setToastEmail] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"Student" | "Faculty" | "Admin">("Student");
  const [newDepartment, setNewDepartment] = useState(adminDepartment ?? "CSE");
  const [addError, setAddError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const sameDepartment = isSuperAdmin || !adminDepartment || u.departmentId === adminDepartment;
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchDirectoryRole = directoryRole === "all" || u.role === directoryRole;
    return sameDepartment && matchSearch && matchRole && matchDirectoryRole;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newName.trim() || !newEmail.trim()) return;

    const actorEmail = adminUser?.email ?? "admin@charusat.edu.in";
    const departmentForStore = isSuperAdmin ? newDepartment : adminDepartment;
    if (!departmentForStore) {
      setAddError(
        "Your admin account is not assigned to a department. Ask a super admin to assign one.",
      );
      return;
    }
    const roleForStore =
      newRole === "Student" ? "student" : newRole === "Faculty" ? "faculty" : "admin";

    // Create directly in MongoDB Atlas via auth store & API
    const authResult = await createUserWithDefaultPassword(
      newName.trim(),
      newEmail.trim(),
      roleForStore,
      actorEmail,
      adminUser?.token,
      departmentForStore,
    );
    if (!authResult.ok) {
      setAddError(authResult.error ?? "Failed to create account.");
      return;
    }

    // Also update local UI table
    await addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: "active",
      passwordStatus: "default",
      departmentId: departmentForStore,
    });

    setToastEmail(newEmail.trim().toLowerCase());
    setNewName("");
    setNewEmail("");
    setShowAdd(false);
  };

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

      {/* Toast */}
      <AnimatePresence>
        {toastEmail && <ConfirmToast email={toastEmail} onDismiss={() => setToastEmail(null)} />}
      </AnimatePresence>

      {/* Account creation zone */}
      <section className="mb-8 rounded-3xl border border-violet/20 bg-gradient-to-br from-violet/10 via-card to-card p-5 shadow-[0_16px_40px_-24px_oklch(0.62_0.22_293_/_45%)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet">
              Workspace action
            </div>
            <h2 className="mt-1 font-serif text-xl font-bold text-foreground">Add new account</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a department-scoped account with the default onboarding password.
            </p>
          </div>
          <div className="hidden rounded-2xl border border-violet/20 bg-violet/10 px-3 py-2 text-right sm:block">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet">
              Scope
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground">
              {adminDepartment ?? "Global"}
            </div>
          </div>
        </div>

        {/* Add user form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-2xl border border-violet/20 bg-violet/5 p-5"
            >
              <div className="mb-3 text-sm font-semibold text-foreground">New Account</div>
              {addError && (
                <div className="mb-3 rounded-xl border border-danger/30 bg-danger/8 px-3 py-2 text-sm text-danger">
                  ⚠ {addError}
                </div>
              )}
              <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet focus:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] transition"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@charusat.edu.in"
                    className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet focus:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] transition"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as typeof newRole)}
                    className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet transition"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  {isSuperAdmin ? (
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet transition"
                    >
                      {DEPARTMENTS.map((department) => (
                        <option key={department.code} value={department.code}>
                          {department.code} · {department.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                      {adminDepartment ?? "Not assigned"}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Cancel
                </button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                Default password{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                  password1234
                </code>{" "}
                will be set. User must change it on first login.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

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
