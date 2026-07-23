import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/student/announcements")({
  component: Announcements,
});

function Announcements() {
  return (
    <div>
      <PageHeader title="Announcements" subtitle="Latest updates from your institution and faculty." />
      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div className="font-serif text-lg font-bold text-slate-900">{a.title}</div>
              <Pill tone="indigo">{a.scope}</Pill>
            </div>
            <p className="mt-2 text-sm text-slate-600">{a.message}</p>
            <div className="mt-3 text-xs text-slate-400">{a.createdAt} · Posted by {a.postedBy}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
