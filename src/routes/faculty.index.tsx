import { createFileRoute } from "@tanstack/react-router";
import { Upload, MessagesSquare, Sparkles } from "lucide-react";
import { PageHeader, StatCard, ActionCard, Card, EmptyState, Pill } from "@/components/app-shell";
import { studentQueries, documents, escalations } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/")({
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const mySubjects = 3;
  const pending = documents.filter((d) => d.status === "pending").length;
  const openEscal = escalations.filter((e) => e.status === "open").length;
  return (
    <div>
      <PageHeader title="Faculty Dashboard" subtitle={`Managing ${mySubjects} subjects.`} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="My Subjects" value={mySubjects} color="indigo" />
        <StatCard label="Docs Pending Approval" value={pending} color="amber" />
        <StatCard label="Student Queries" value={studentQueries.length} color="green" />
        <StatCard label="Open Escalations" value={openEscal} color="teal" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard icon={Upload} title="Upload Content" description="Add PDFs, slides, or notes for approval." color="indigo" />
        <ActionCard icon={MessagesSquare} title="Review Student Queries" description="See what students are asking the tutor." color="amber" />
        <ActionCard icon={Sparkles} title="Generate a Quiz" description="Auto-generate quiz questions from a document." color="green" />
      </div>
      <div className="mt-6">
        <Card title="Recent Student Questions">
          {studentQueries.length === 0 ? (
            <EmptyState icon={MessagesSquare} title="No questions asked yet" description="Student questions will appear here as they use the tutor." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {studentQueries.slice(0, 5).map((q) => (
                <li key={q.id} className="py-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-slate-900">{q.question}</div>
                      <div className="mt-1 text-xs text-slate-500">{q.student} · {q.createdAt}</div>
                    </div>
                    <Pill tone="indigo">{q.subject}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
