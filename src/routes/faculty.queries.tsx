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
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="pb-3">Student</th><th className="pb-3">Subject</th><th className="pb-3">Question</th><th className="pb-3">When</th>
            </tr>
          </thead>
          <tbody>
            {studentQueries.map((q) => (
              <tr key={q.id} className="border-t border-border hover:bg-accent/40">
                <td className="py-3 font-medium text-foreground">{q.student}</td>
                <td className="py-3"><Pill tone="indigo">{q.subject}</Pill></td>
                <td className="py-3 text-foreground">{q.question}</td>
                <td className="py-3 text-xs text-muted-foreground">{q.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
