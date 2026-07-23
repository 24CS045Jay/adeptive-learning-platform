import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton, statusTone } from "@/components/app-shell";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div>
      <PageHeader title="Users" subtitle="All platform users across roles." action={<PrimaryButton icon={Plus}>Add User</PrimaryButton>} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Name</th><th className="pb-3">Role</th><th className="pb-3">Email</th><th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 font-medium text-slate-900">{u.name}</td>
                <td className="py-3 text-slate-600">{u.role}</td>
                <td className="py-3 text-slate-600">{u.email}</td>
                <td className="py-3"><Pill tone={statusTone(u.status)}>{u.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
