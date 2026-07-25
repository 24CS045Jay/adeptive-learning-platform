import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, MessagesSquare, Sparkles, BookOpen } from "lucide-react";
import { PageHeader, StatCard, ActionCard, Card, EmptyState, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/faculty/")({
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const { documents, queries, escalations, subjects } = useAppData();
  const { user } = useAuth();

  const myEmail = user?.email?.toLowerCase() ?? "faculty@charusat.edu.in";
  const myName  = user?.name ?? "Dr. Nisha Shah";

  // Documents uploaded by current faculty (or seeded demo faculty)
  const myDocs = documents.filter((d) => {
    const isOwner = d.uploadedBy.toLowerCase() === myEmail || d.uploadedByName.toLowerCase() === myName.toLowerCase();
    if (myEmail === "faculty@charusat.edu.in") return isOwner || d.uploadedBy === "faculty@charusat.edu.in";
    return isOwner;
  });

  // Subjects assigned to current faculty
  const mySubjects = subjects.filter((s) => {
    if (myEmail === "faculty@charusat.edu.in") return s.faculty === "Dr. Nisha Shah";
    return s.faculty.toLowerCase().includes(myName.toLowerCase()) || myDocs.some((d) => d.subjectId === s.id);
  });

  const displaySubjectsCount = mySubjects.length > 0 ? mySubjects.length : subjects.length;
  const pendingCount = myDocs.filter((d) => d.status === "pending").length;
  const totalPending = documents.filter((d) => d.status === "pending").length;
  const openEscal    = escalations.filter((e) => e.status === "open").length;

  return (
    <div>
      <PageHeader
        title="Faculty Dashboard"
        subtitle={`Welcome back, ${myName}. Managing ${displaySubjectsCount} CSE subjects.`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link to="/faculty/subjects" className="block transition hover:-translate-y-0.5">
          <StatCard label="My Subjects" value={displaySubjectsCount} color="indigo" caption="Click to manage subjects & syllabus →" />
        </Link>
        <Link to="/faculty/documents" className="block transition hover:-translate-y-0.5">
          <StatCard label="My Documents" value={myDocs.length} color="amber" caption="View contributed materials →" />
        </Link>
        <Link to="/faculty/upload" className="block transition hover:-translate-y-0.5">
          <StatCard label="Docs Pending Approval" value={totalPending} color="red" caption={pendingCount > 0 ? `${pendingCount} uploaded by you` : "Awaiting admin review"} />
        </Link>
        <Link to="/faculty/escalations" className="block transition hover:-translate-y-0.5">
          <StatCard label="Open Escalations" value={openEscal} color="teal" caption="Student questions needing response →" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard icon={Upload}         title="Upload Content"          description="Add PDFs, slides, or notes for approval."       color="indigo" />
        <ActionCard icon={MessagesSquare} title="Review Student Queries" description="See what students are asking the tutor."        color="amber" />
        <ActionCard icon={Sparkles}       title="Generate a Quiz"        description="Auto-generate quiz questions from a document."  color="green" />
      </div>

      <div className="mt-6">
        <Card title="Recent Student Questions">
          {queries.length === 0 ? (
            <EmptyState icon={MessagesSquare} title="No questions asked yet" description="Student questions will appear here as they use the tutor." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {queries.slice(0, 5).map((q) => (
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
