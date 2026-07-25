import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, Trash2, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/announcements")({
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useAppData();
  const { user } = useAuth();

  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope]     = useState("Institution");
  const [posted, setPosted]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    addAnnouncement({
      title: title.trim(),
      message: message.trim(),
      scope,
      postedBy: user?.name ?? "Rahul Mehta",
    });
    setTitle("");
    setMessage("");
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle={`Broadcast updates across the institution. ${announcements.length} active announcements.`}
      />

      <Card title="Post an announcement">
        {posted && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Announcement broadcasted successfully to all users!
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:max-w-2xl">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-semester Examination Schedule"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-brand"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Target Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-brand font-medium"
            >
              <option value="Institution">Institution-wide (All Students & Faculty)</option>
              <option value="Big Data Analytics">Big Data Analytics (CSE501)</option>
              <option value="Machine Learning">Machine Learning (CSE502)</option>
              <option value="Cloud Computing">Cloud Computing (CSE503)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write announcement details here..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-brand"
              required
            />
          </div>

          <div>
            <PrimaryButton type="submit" icon={Megaphone}>
              Post Announcement
            </PrimaryButton>
          </div>
        </form>
      </Card>

      {/* Announcements List */}
      <div className="mt-6 space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-serif text-lg font-bold text-slate-900">{a.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.message}</p>
                <div className="mt-3 text-xs text-slate-400">
                  {a.createdAt} · Posted by <span className="font-medium text-slate-600">{a.postedBy}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
          </Card>
        ))}
      </div>
    </div>
  );
}
