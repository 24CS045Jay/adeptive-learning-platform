import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserCheck, UserX, Search, CheckCircle2, KeyRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card, Pill, PrimaryButton, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { createUserWithDefaultPassword } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  Student: { text: "text-violet",      bg: "bg-violet/10",       ring: "avatar-ring-violet" },
  Faculty: { text: "text-gold",        bg: "bg-gold/10",         ring: "avatar-ring-gold" },
  Admin:   { text: "text-teal-brand",  bg: "bg-teal-brand/10",   ring: "avatar-ring-teal" },
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
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">password1234</code>{" "}
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

  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd]       = useState(false);
  const [toastEmail, setToastEmail] = useState<string | null>(null);

  const [newName,  setNewName]  = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole,  setNewRole]  = useState<"Student" | "Faculty" | "Admin">("Student");
  const [addError, setAddError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newName.trim() || !newEmail.trim()) return;

    const actorEmail = adminUser?.email ?? "admin@charusat.edu.in";
    const roleForStore = newRole === "Student" ? "student" : newRole === "Faculty" ? "faculty" : "admin";

    // Create in auth store (sets default password + mustChangePassword)
    const authResult = createUserWithDefaultPassword(newName.trim(), newEmail.trim(), roleForStore, actorEmail);
    if (!authResult.ok) { setAddError(authResult.error ?? "Failed to create account."); return; }

    // Also add to app data context for the UI table
    addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: "active",
      passwordStatus: "default",
    });

    setToastEmail(newEmail.trim().toLowerCase());
    setNewName(""); setNewEmail(""); setShowAdd(false);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total · ${users.filter(u => u.role === "Student").length} students · ${users.filter(u => u.role === "Faculty").length} faculty`}
        action={<PrimaryButton icon={Plus} onClick={() => { setShowAdd(true); setAddError(null); }}>Add User</PrimaryButton>}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastEmail && (
          <ConfirmToast email={toastEmail} onDismiss={() => setToastEmail(null)} />
        )}
      </AnimatePresence>

      {/* Role filter pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", "Student", "Faculty", "Admin"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150",
              roleFilter === r
                ? "bg-violet text-white shadow-[0_0_12px_-3px_oklch(0.62_0.22_293_/_40%)]"
                : "border border-border bg-card text-muted-foreground hover:border-violet/40 hover:text-foreground"
            )}
          >
            {r === "all" ? `All (${users.length})` : `${r}s (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
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
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Priya Sharma"
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet focus:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] transition" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@charusat.edu.in"
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet focus:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] transition" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-muted-foreground">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as typeof newRole)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet transition">
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-violet to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
                Create Account
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-muted-foreground hover:text-foreground transition">
                Cancel
              </button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              Default password <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">password1234</code> will be set. User must change it on first login.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 transition-all focus-within:border-violet/40 focus-within:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_10%)]">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <Card>
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
                const rc = ROLE_COLORS[u.role] ?? { text: "text-foreground", bg: "bg-muted", ring: "" };
                const isDefault = u.passwordStatus === "default";
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03, duration: 0.15 }}
                    className={cn(
                      "border-t border-border transition hover:bg-accent/40",
                      idx % 2 === 0 ? "" : "bg-muted/20"
                    )}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", rc.bg, rc.text, rc.ring)}>
                            {u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          {u.status === "active" && (
                            <span className="online-dot absolute -bottom-0.5 -right-0.5" />
                          )}
                        </div>
                        <span className="font-medium text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", rc.bg, rc.text)}>
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
                          className={cn("rounded-lg p-1.5 transition hover:bg-accent hover:text-gold", u.status === "inactive" && "text-gold")}
                        >
                          {u.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
                <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
