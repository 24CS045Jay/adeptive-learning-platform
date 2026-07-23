import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { studentQueries } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/queries")({
  component: StudentQueriesPage,
});

function StudentQueriesPage() {
  return (
    <div>
      <PageHeader title="Student Queries" subtitle="What your students are asking the AI Tutor." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Student</th><th className="pb-3">Subject</th><th className="pb-3">Question</th><th className="pb-3">When</th>
            </tr>
          </thead>
          <tbody>
            {studentQueries.map((q) => (
              <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 font-medium text-slate-900">{q.student}</td>
                <td className="py-3"><Pill tone="indigo">{q.subject}</Pill></td>
                <td className="py-3 text-slate-700">{q.question}</td>
                <td className="py-3 text-xs text-slate-500">{q.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
