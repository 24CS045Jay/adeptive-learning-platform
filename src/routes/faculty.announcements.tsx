import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Trash2, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/faculty/announcements")({
  component: FacultyAnnouncements,
});

function FacultyAnnouncements() {
  const { announcements, subjects, addAnnouncement, deleteAnnouncement } = useAppData();
  const { user } = useAuth();

  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope]     = useState(subjects[0]?.name ?? "Big Data Analytics");
  const [posted, setPosted]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    addAnnouncement({
      title: title.trim(),
      message: message.trim(),
      scope,
      postedBy: user?.name ?? "Dr. Nisha Shah",
    });
    setTitle("");
    setMessage("");
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Faculty Announcements"
        subtitle="Post announcements for your subjects or view institution-wide updates."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Post Form */}
        <Card className="lg:col-span-2" title="Post subject announcement">
          {posted && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Posted to students!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Subject
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                ))}
                <option value="Institution">Institution-wide</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Extra doubt session on Friday"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write announcement details..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-brand"
                required
              />
            </div>

            <PrimaryButton type="submit" icon={Megaphone}>
              Post to subject
            </PrimaryButton>
          </form>
        </Card>

        {/* Announcements List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Active Announcements ({announcements.length})
          </div>
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="font-serif text-base font-bold text-slate-900">{a.title}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <Pill tone="indigo">{a.scope}</Pill>
                  <button
                    type="button"
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-slate-300 hover:text-red-brand transition"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.message}</p>
              <div className="mt-3 text-xs text-slate-400">
                {a.createdAt} · Posted by <span className="font-medium text-slate-600">{a.postedBy}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
