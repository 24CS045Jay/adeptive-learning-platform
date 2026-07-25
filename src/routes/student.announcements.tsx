import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/student/announcements")({
  component: Announcements,
});

function Announcements() {
  const { announcements } = useAppData();

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Latest updates from your institution and faculty." />
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-slate-500 py-8">No announcements posted yet.</p>
          </Card>
        ) : (
          announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="font-serif text-lg font-bold text-slate-900">{a.title}</div>
                <Pill tone="indigo">{a.scope}</Pill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.message}</p>
              <div className="mt-3 text-xs text-slate-400">{a.createdAt} · Posted by <span className="font-medium text-slate-600">{a.postedBy}</span></div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
