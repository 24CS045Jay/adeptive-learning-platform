import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCcw, Trash2, SlidersHorizontal, FileText, Presentation, FileType2, Sliders } from "lucide-react";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { PassageWorkbenchModal } from "@/components/passage-workbench";
import type { Difficulty, FileType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/knowledge")({
  component: KnowledgeBase,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf:  FileText,
  pptx: Presentation,
  docx: FileType2,
};

const FILE_COLORS: Record<FileType, string> = {
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

function KnowledgeBase() {
  const { documents, subjects, modules: learningModules, deleteDocument } = useAppData();
  const [subjectFilter, setSubjectFilter]       = useState("all");
  const [statusFilter, setStatusFilter]         = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter]     = useState("all");
  const [showFilters, setShowFilters]           = useState(false);
  const [rerankDoc, setRerankDoc]               = useState<{ id: string; name: string } | null>(null);

  const indexed = documents.filter((d) => d.status === "approved");
  const totalChunks = indexed.reduce((acc, d) => acc + d.chunks, 0);

  const filtered = documents.filter((d) => {
    if (subjectFilter !== "all" && d.subjectId !== subjectFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (difficultyFilter !== "all" && d.difficulty !== difficultyFilter) return false;
    if (fileTypeFilter !== "all" && d.fileType !== fileTypeFilter) return false;
    return true;
  });

  const hasActiveFilters =
    subjectFilter !== "all" ||
    statusFilter !== "all" ||
    difficultyFilter !== "all" ||
    fileTypeFilter !== "all";

  const clearFilters = () => {
    setSubjectFilter("all");
    setStatusFilter("all");
    setDifficultyFilter("all");
    setFileTypeFilter("all");
  };

  return (
    <div>
      <PageHeader
        title="Knowledge Base Oversight"
        subtitle="Manage vector database indexing, chunk inspection, and document metadata across all subjects."
        action={
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              showFilters || hasActiveFilters
                ? "border-indigo-brand bg-indigo-brand/5 text-indigo-brand"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-brand/40"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {hasActiveFilters && "•"}
          </button>
        }
      />

      {/* Summary metric cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Documents",  value: documents.length, color: "text-slate-900" },
          { label: "Indexed & Live",   value: indexed.length,    color: "text-green-brand" },
          { label: "Pending Review",   value: documents.filter(d => d.status === "pending").length, color: "text-amber-brand" },
          { label: "Total Vector Chunks", value: totalChunks.toLocaleString(), color: "text-indigo-brand" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
            <div className={cn("mt-2 text-3xl font-bold", color)}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter Documents</span>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-medium text-indigo-brand hover:underline">
                Clear all filters
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Subject</label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved & Indexed</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-400">Format</label>
              <select
                value={fileTypeFilter}
                onChange={(e) => setFileTypeFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF</option>
                <option value="pptx">PPTX</option>
                <option value="docx">DOCX</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
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
                <th className="pb-3 pr-4">Sem</th>
                <th className="pb-3 pr-4">Uploaded By</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Chunks</th>
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
                          <div className="font-medium text-slate-900 leading-tight max-w-[180px] truncate">{d.name}</div>
                          <div className="text-[11px] text-slate-400 uppercase">{d.fileType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600">{subj?.name ?? "—"}</td>
                    <td className="py-3 pr-4 max-w-[140px]">
                      <span className="block truncate text-xs text-slate-500">{mod?.name ?? <span className="italic text-slate-400">—</span>}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {d.topicTag ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{d.topicTag}</span>
                      ) : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", DIFFICULTY_PILL[d.difficulty])}>
                        {d.difficulty}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{d.semester}</td>
                    <td className="py-3 pr-4 text-slate-500 whitespace-nowrap text-xs">{d.uploadedByName ?? d.uploadedBy}</td>
                    <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap">{d.uploadDate}</td>
                    <td className="py-3 pr-4"><Pill tone={statusTone(d.status)}>{d.status}</Pill></td>
                    <td className="py-3 pr-4 text-slate-600">{d.chunks || "—"}</td>
                    <td className="py-3">
                      <div className="flex gap-2 text-slate-400">
                        <button
                          className="hover:text-indigo-brand transition"
                          title="Inspect & Rerank Chunks"
                          onClick={() => setRerankDoc({ id: d.id, name: d.name })}
                        >
                          <Sliders className="h-4 w-4 text-indigo-brand" />
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
                  <td colSpan={11} className="py-12 text-center text-sm text-slate-400">
                    No documents match the current filters.
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
    </div>
  );
}
