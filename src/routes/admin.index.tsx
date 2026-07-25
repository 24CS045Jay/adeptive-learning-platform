import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { users, subjects, documents, escalations, topicVolume } = useAppData();

  const students  = users.filter((u) => u.role === "Student").length;
  const faculty   = users.filter((u) => u.role === "Faculty").length;
  const admins    = users.filter((u) => u.role === "Admin").length;
  const openEsc   = escalations.filter((e) => e.status === "open").length;
  const pending   = documents.filter((d) => d.status === "pending").length;
  const approved  = documents.filter((d) => d.status === "approved").length;
  const rejected  = documents.filter((d) => d.status === "rejected").length;

  // Subject activity derived live
  const subjectActivity = subjects.map((s) => ({
    subject: s.name,
    approvedDocs: documents.filter((d) => d.subjectId === s.id && d.status === "approved").length,
  }));

  return (
    <div>
      <PageHeader title="Institution Overview" subtitle="Platform-wide stats across all subjects and users." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Students" value={students} caption={`${faculty} faculty · ${admins} admin`} color="indigo" />
        <StatCard label="Subjects" value={subjects.length} color="amber" />
        <StatCard label="Pending Approvals" value={pending} color="red" />
        <StatCard label="Open Escalations" value={openEsc} color="teal" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Document Approval Queue">
          <ul className="divide-y divide-slate-100">
            <li className="flex items-center justify-between py-3"><span className="text-sm text-slate-700">Pending review</span><Pill tone="amber">{pending}</Pill></li>
            <li className="flex items-center justify-between py-3"><span className="text-sm text-slate-700">Approved & indexed</span><Pill tone="green">{approved}</Pill></li>
            <li className="flex items-center justify-between py-3"><span className="text-sm text-slate-700">Rejected</span><Pill tone="red">{rejected}</Pill></li>
          </ul>
        </Card>
        <Card title="Most-Asked Topics">
          <ul className="divide-y divide-slate-100">
            {topicVolume.slice(0, 5).map((t) => (
              <li key={t.topic} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-700">{t.topic}</span>
                <Pill tone="indigo">{t.asked} asked</Pill>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-6">
        <Card title="Subject Activity — Approved Documents">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Subject</th><th className="pb-3">Approved Docs</th><th className="pb-3">Enrolled Students</th>
              </tr>
            </thead>
            <tbody>
              {subjectActivity.map((s) => {
                const subj = subjects.find(x => x.name === s.subject);
                return (
                  <tr key={s.subject} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{s.subject}</td>
                    <td className="py-3 text-slate-600">{s.approvedDocs}</td>
                    <td className="py-3 text-slate-600">{subj?.enrolledStudentIds.length ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
