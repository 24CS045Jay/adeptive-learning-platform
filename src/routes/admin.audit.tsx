import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { auditLogs } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/audit")({
  component: AuditLogsPage,
});

function actionTone(a: string) {
  if (a === "APPROVE_DOCUMENT") return "green" as const;
  if (a === "UPLOAD_DOCUMENT") return "indigo" as const;
  return "slate" as const;
}

function AuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Login history and content/system changes (latest 500)." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Time</th><th className="pb-3">Actor</th><th className="pb-3">Action</th><th className="pb-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((l) => (
              <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 text-slate-600">{l.time}</td>
                <td className="py-3 text-slate-700">{l.actor}</td>
                <td className="py-3"><Pill tone={actionTone(l.action)}>{l.action}</Pill></td>
                <td className="py-3 font-mono text-xs text-slate-600">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
