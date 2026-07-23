import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/announcements")({
  component: FacultyAnnouncements,
});

function FacultyAnnouncements() {
  return (
    <div>
      <PageHeader title="Announcements" subtitle="Post to your subject or view institution-wide updates." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Post subject announcement">
          <div className="space-y-3">
            <input placeholder="Title" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            <textarea placeholder="Message" rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            <PrimaryButton icon={Megaphone}>Post to subject</PrimaryButton>
          </div>
        </Card>
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div className="font-serif text-base font-bold text-slate-900">{a.title}</div>
                <Pill tone="indigo">{a.scope}</Pill>
              </div>
              <p className="mt-2 text-sm text-slate-600">{a.message}</p>
              <div className="mt-2 text-xs text-slate-400">{a.createdAt} · {a.postedBy}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
