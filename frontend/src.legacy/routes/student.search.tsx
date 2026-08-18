import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/student/search")({
  component: SearchNotes,
});

function SearchNotes() {
  const { documents, subjects } = useAppData();
  const [q, setQ] = useState("");
  const results = documents.filter((d) => d.status === "approved" && (q === "" || d.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <PageHeader title="Search Notes" subtitle="Search across all approved, indexed course material." />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes, slides, textbooks..." className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      <Card>
        <ul className="divide-y divide-border">
          {results.map((d) => {
            const subj = subjects.find((s) => s.id === d.subjectId);
            return (
              <li key={d.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-foreground">{d.name}</div>
                  <Pill tone="indigo">{subj?.name}</Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  …excerpt matched: "the shuffle phase groups intermediate key/value pairs before reducers consume them, ensuring locality-aware sort/merge…"
                </p>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
