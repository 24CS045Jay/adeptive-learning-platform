import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { bookmarks } from "@/lib/mock-data";

export const Route = createFileRoute("/student/bookmarks")({
  component: Bookmarks,
});

function Bookmarks() {
  return (
    <div>
      <PageHeader title="Bookmarks" subtitle="Answers and notes you saved for revision." />
      <div className="grid gap-4 md:grid-cols-2">
        {bookmarks.map((b) => (
          <Card key={b.id}>
            <div className="flex items-start justify-between">
              <div className="font-serif text-lg font-bold text-slate-900">{b.question}</div>
              <Pill tone="indigo">{b.subject}</Pill>
            </div>
            <p className="mt-2 text-sm text-slate-600">{b.answer}</p>
            <div className="mt-3 text-xs text-slate-400">Saved {b.date}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
