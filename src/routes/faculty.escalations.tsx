import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { escalations } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/escalations")({
  component: Escalations,
});

function Escalations() {
  return (
    <div>
      <PageHeader title="Escalations" subtitle="Cases where the AI Tutor couldn't confidently answer from approved material." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Student</th><th className="pb-3">Subject</th><th className="pb-3">Question</th><th className="pb-3">Status</th><th className="pb-3">Escalated At</th>
            </tr>
          </thead>
          <tbody>
            {escalations.map((e) => (
              <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 font-medium text-slate-900">{e.student}</td>
                <td className="py-3"><Pill tone="indigo">{e.subject}</Pill></td>
                <td className="py-3 text-slate-700">{e.question}</td>
                <td className="py-3"><Pill tone={statusTone(e.status)}>{e.status}</Pill></td>
                <td className="py-3 text-xs text-slate-500">{e.escalatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
