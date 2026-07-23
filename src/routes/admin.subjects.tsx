import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Card, PrimaryButton } from "@/components/app-shell";
import { subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/subjects")({
  component: SubjectsPage,
});

function SubjectsPage() {
  return (
    <div>
      <PageHeader title="Courses & Subjects" subtitle="Semester → Subject hierarchy for CSE." action={<PrimaryButton icon={Plus}>Add Subject</PrimaryButton>} />
      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-lg font-bold text-slate-900">{s.name}</div>
                <div className="mt-1 text-xs text-slate-500">{s.code} · Semester {s.semester}</div>
                <div className="mt-3 text-sm text-slate-600">Assigned faculty: <span className="font-medium">{s.faculty}</span></div>
              </div>
              <button className="text-slate-300 hover:text-red-brand"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
