import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCcw, Trash2, FileText, Presentation, FileType2, Sliders, BookOpen } from "lucide-react";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { PassageWorkbenchModal } from "@/components/passage-workbench";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import type { FileType, Difficulty } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/documents")({
  component: MyDocuments,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf:  FileText,
  pptx: Presentation,
  docx: FileType2,
};

export const FILE_COLORS: Record<FileType, string> = {
  pdf:  "text-red-brand bg-red-brand/10",
  pptx: "text-amber-700 bg-amber-brand/15",
  docx: "text-indigo-brand bg-indigo-brand/10",
};

const DIFFICULTY_PILL: Record<Difficulty, string> = {
  easy:   "bg-green-brand/10 text-green-700",
  medium: "bg-amber-brand/15 text-amber-700",
  hard:   "bg-red-brand/10 text-red-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

function MyDocuments() {
  const { documents, subjects, modules: learningModules, deleteDocument } = useAppData();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [rerankDoc, setRerankDoc]       = useState<{ id: string; name: string } | null>(null);
  const [viewPdfDoc, setViewPdfDoc]     = useState<{ name: string; fileType: FileType; subjectId: string; uploadedBy: string; date: string } | null>(null);

  const myEmail = user?.email?.toLowerCase() ?? "faculty@charusat.edu.in";
  const myName  = user?.name ?? "Dr. Nisha Shah";

  // Show docs uploaded by the logged-in faculty (or all seeded docs if demo faculty)
  const mine = documents.filter((d) => {
    const isOwner = d.uploadedBy.toLowerCase() === myEmail || d.uploadedByName.toLowerCase() === myName.toLowerCase();
    if (myEmail === "faculty@charusat.edu.in") return isOwner || d.uploadedBy === "faculty@charusat.edu.in";
    return isOwner;
  });

  const filtered = filterStatus === "all" ? mine : mine.filter((d) => d.status === filterStatus);

  return (
    <div>
      <PageHeader
        title="My Documents"
        subtitle="Everything you've contributed to the knowledge base. View document files, inspect multi-modal chunks, and adjust reranking weights."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            {["all", "approved", "pending", "rejected"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                  filterStatus === s
                    ? "bg-indigo-brand text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-brand/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total",        value: mine.length, color: "text-slate-900" },
          { label: "Approved",     value: mine.filter(d => d.status === "approved").length, color: "text-green-brand" },
          { label: "Pending",      value: mine.filter(d => d.status === "pending").length, color: "text-amber-brand" },
          { label: "Total chunks", value: mine.reduce((s, d) => s + d.chunks, 0), color: "text-indigo-brand" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
            <div className={cn("mt-2 text-3xl font-bold", color)}>{value}</div>
          </div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Document</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Module</th>
                <th className="pb-3 pr-4">Topic</th>
                <th className="pb-3 pr-4">Difficulty</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Chunks</th>
                <th className="pb-3 pr-4">Uploaded</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const subj = subjects.find((s) => s.id === d.subjectId);
                const mod  = learningModules.find((m) => m.id === d.moduleId);
                const Icon = FILE_ICONS[d.fileType];
                return (
                  <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", FILE_COLORS[d.fileType])}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-medium text-slate-900 leading-tight">{d.name}</div>
                          <div className="text-[11px] text-slate-400 uppercase">{d.fileType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">{subj?.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-500 max-w-[160px]">
                      <span className="truncate block text-xs">{mod?.name ?? <span className="italic text-slate-400">—</span>}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {d.topicTag ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{d.topicTag}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", DIFFICULTY_PILL[d.difficulty])}>
                        {d.difficulty}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={statusTone(d.status)}>{d.status}</Pill>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{d.chunks || "—"}</td>
                    <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap">{d.uploadDate}</td>
                    <td className="py-3">
                      <div className="flex gap-2 text-slate-400">
                        <button
                          className="hover:text-indigo-brand transition"
                          title="Read Document File"
                          onClick={() => setViewPdfDoc({ name: d.name, fileType: d.fileType, subjectId: d.subjectId, uploadedBy: d.uploadedByName ?? d.uploadedBy, date: d.uploadDate })}
                        >
                          <BookOpen className="h-4 w-4 text-indigo-brand" />
                        </button>
                        <button
                          className="hover:text-indigo-brand transition"
                          title="Inspect & Rerank Chunks"
                          onClick={() => setRerankDoc({ id: d.id, name: d.name })}
                        >
                          <Sliders className="h-4 w-4 text-slate-400 hover:text-indigo-brand" />
                        </button>
                        <button className="hover:text-red-brand" title="Delete" onClick={() => deleteDocument(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                    No documents match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reranking Workbench Modal */}
      {rerankDoc && (
        <PassageWorkbenchModal
          docId={rerankDoc.id}
          docName={rerankDoc.name}
          onClose={() => setRerankDoc(null)}
        />
      )}

      {/* Document Viewer Modal */}
      {viewPdfDoc && (
        <DocumentViewerModal
          docName={viewPdfDoc.name}
          fileType={viewPdfDoc.fileType}
          subjectName={subjects.find((s) => s.id === viewPdfDoc.subjectId)?.name ?? "CSE Subject"}
          uploadedBy={viewPdfDoc.uploadedBy}
          uploadDate={viewPdfDoc.date}
          onClose={() => setViewPdfDoc(null)}
        />
      )}
    </div>
  );
}
