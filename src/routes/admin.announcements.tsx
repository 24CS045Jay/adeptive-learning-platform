import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Trash2 } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  return (
    <div>
      <PageHeader title="Announcements" subtitle="Broadcast to the entire institution." />
      <Card title="Post an announcement">
        <div className="grid gap-3 md:max-w-2xl">
          <input placeholder="Title" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          <textarea placeholder="Message" rows={4} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          <div><PrimaryButton icon={Megaphone}>Post Announcement</PrimaryButton></div>
        </div>
      </Card>
      <div className="mt-6 space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-base font-bold text-slate-900">{a.title}</div>
                <p className="mt-2 text-sm text-slate-600">{a.message}</p>
                <div className="mt-2 text-xs text-slate-400">{a.createdAt} · Posted by {a.postedBy}</div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone="indigo">{a.scope}</Pill>
                <button className="text-slate-300 hover:text-red-brand"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
