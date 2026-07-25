import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserCheck, UserX, Search } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLE_COLORS: Record<string, string> = {
  Student: "bg-indigo-brand/10 text-indigo-brand",
  Faculty: "bg-amber-brand/15 text-amber-700",
  Admin:   "bg-teal-brand/10 text-teal-brand",
};

function UsersPage() {
  const { users, addUser, removeUser, toggleUserStatus } = useAppData();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  // Add user form
  const [newName,  setNewName]  = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole,  setNewRole]  = useState<"Student" | "Faculty" | "Admin">("Student");

  const filtered = users.filter((u) => {
    const matchSearch = search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    addUser({ name: newName.trim(), email: newEmail.trim(), role: newRole, status: "active" });
    setNewName(""); setNewEmail(""); setShowAdd(false);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} total · ${users.filter(u => u.role === "Student").length} students · ${users.filter(u => u.role === "Faculty").length} faculty`}
        action={<PrimaryButton icon={Plus} onClick={() => setShowAdd(true)}>Add User</PrimaryButton>}
      />

      {/* Summary pills */}
      <div className="mb-5 flex flex-wrap gap-3">
        {["all", "Student", "Faculty", "Admin"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              roleFilter === r
                ? "bg-indigo-brand text-white"
                : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-brand/40"
            )}
          >
            {r === "all" ? `All (${users.length})` : `${r}s (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
      </div>

      {/* Add user inline form */}
      {showAdd && (
        <div className="mb-5 rounded-2xl border border-indigo-brand/20 bg-indigo-brand/5 p-5">
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Full name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Priya Sharma"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@charusat.edu.in"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as typeof newRole)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-indigo-brand px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-brand-hover">
              Add
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-slate-500 hover:text-slate-700">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", ROLE_COLORS[u.role])}>
                        {u.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", ROLE_COLORS[u.role])}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                  <td className="py-3 pr-4"><Pill tone={statusTone(u.status)}>{u.status}</Pill></td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{u.joinedAt}</td>
                  <td className="py-3">
                    <div className="flex gap-2 text-slate-400">
                      <button onClick={() => toggleUserStatus(u.id)} title={u.status === "active" ? "Deactivate" : "Activate"}
                        className={cn("hover:text-amber-brand transition", u.status === "inactive" && "text-amber-brand")}>
                        {u.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button onClick={() => removeUser(u.id)} title="Remove user"
                        className="hover:text-red-brand transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
