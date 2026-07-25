import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Download, FileText, Plus, Trash2, CheckCircle2, Edit3 } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { bookmarks as defaultBookmarks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/bookmarks")({
  component: Bookmarks,
});

interface BookmarkItem {
  id: string;
  question: string;
  answer: string;
  subject: string;
  date: string;
  notes?: string;
}

function Bookmarks() {
  const [items, setItems] = useState<BookmarkItem[]>(defaultBookmarks as BookmarkItem[]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [editingItem, setEditingItem]         = useState<BookmarkItem | null>(null);
  const [noteText, setNoteText]               = useState("");
  const [exportBanner, setExportBanner]       = useState(false);

  const filtered = selectedSubject === "all"
    ? items
    : items.filter((b) => b.subject === selectedSubject);

  const handleSaveNote = () => {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((b) => (b.id === editingItem.id ? { ...b, notes: noteText } : b))
    );
    setEditingItem(null);
    setNoteText("");
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((b) => b.id !== id));
  };

  const handleExportNotebook = () => {
    const markdownContent = [
      "# My AI Tutor Personal Study Notebook",
      `Exported: ${new Date().toLocaleDateString()}`,
      "---",
      "",
    ];

    filtered.forEach((b, i) => {
      markdownContent.push(`## ${i + 1}. [${b.subject}] ${b.question}`);
      markdownContent.push(`**Saved Date:** ${b.date}`);
      markdownContent.push(`**Answer:** ${b.answer}`);
      if (b.notes) markdownContent.push(`**Personal Note:** ${b.notes}`);
      markdownContent.push("");
    });

    const blob = new Blob([markdownContent.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study_notebook_${new Date().toISOString().split("T")[0]}.md`;
    a.click();

    setExportBanner(true);
    setTimeout(() => setExportBanner(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Personal Study Notebook & Bookmarks"
        subtitle={`Saved AI Tutor answers, formula citations, and personal notes for quick exam revision (${filtered.length} saved).`}
        action={
          <button
            type="button"
            onClick={handleExportNotebook}
            className="flex items-center gap-2 rounded-xl bg-indigo-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-brand-hover shadow-sm transition"
          >
            <Download className="h-4 w-4" /> Export Notebook (Markdown)
          </button>
        }
      />

      {exportBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700 font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Study Notebook exported as Markdown! File saved to your downloads.
        </div>
      )}

      {/* Filter Chips */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Filter Subject:</span>
        {["all", "Big Data Analytics", "Machine Learning"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelectedSubject(s)}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition",
              selectedSubject === s
                ? "bg-indigo-brand text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-brand/40"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((b) => (
          <Card key={b.id} className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="font-serif text-base font-bold text-slate-900 leading-snug">
                  {b.question}
                </div>
                <Pill tone="indigo">{b.subject}</Pill>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 font-sans bg-slate-50 p-3 rounded-xl">
                {b.answer}
              </p>

              {b.notes && (
                <div className="rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 p-3 text-xs text-indigo-brand space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Edit3 className="h-3.5 w-3.5" /> Personal Note:
                  </div>
                  <p className="text-slate-700 font-sans">{b.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Saved {b.date}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingItem(b); setNoteText(b.notes ?? ""); }}
                  className="flex items-center gap-1 font-semibold text-indigo-brand hover:underline"
                >
                  <Edit3 className="h-3.5 w-3.5" /> {b.notes ? "Edit Note" : "Add Note"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="text-slate-300 hover:text-red-brand transition"
                  title="Delete bookmark"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Note Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-serif text-lg font-bold text-slate-900">
                Add Personal Note
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">{editingItem.question}</div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your custom notes, mnemonic devices, or exam reminders..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-indigo-brand"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="rounded-xl bg-indigo-brand px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-brand-hover"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
