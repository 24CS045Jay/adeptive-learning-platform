import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader, Card, PrimaryButton } from "@/components/app-shell";
import { subjects, subjectActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
});

function Reports() {
  const now = new Date().toLocaleString();
  const rows = subjects.map((s, i) => ({
    subject: s.name,
    code: s.code,
    approved: subjectActivity[i]?.approvedDocs ?? 0,
    queries: subjectActivity[i]?.queries ?? 0,
    mastery: [72, 81, 65, 68, 74, 59][i] ?? null,
  }));
  return (
    <div>
      <PageHeader title="Reports" subtitle={`Generated ${now}.`} action={<PrimaryButton icon={Download}>Export CSV</PrimaryButton>} />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Subject</th><th className="pb-3">Code</th><th className="pb-3">Approved Documents</th><th className="pb-3">Total Queries</th><th className="pb-3">Avg Student Mastery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 font-medium text-slate-900">{r.subject}</td>
                <td className="py-3 text-slate-600">{r.code}</td>
                <td className="py-3 text-slate-600">{r.approved}</td>
                <td className="py-3 text-slate-600">{r.queries}</td>
                <td className="py-3 text-slate-600">{r.mastery != null ? `${r.mastery}%` : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
