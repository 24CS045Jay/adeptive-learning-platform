import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check, X, FileText, Presentation, FileType2, Eye,
  ShieldCheck, AlertCircle, BookOpen, Layers, Sparkles, Image as ImageIcon,
} from "lucide-react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { DocumentViewerModal } from "@/components/document-viewer-modal";
import type { AppDocument } from "@/lib/app-data-context";
import type { FileType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/approvals")({
  component: ApprovalsPage,
});

const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf: FileText, pptx: Presentation, docx: FileType2,
};
const FILE_COLORS: Record<FileType, string> = {
  pdf: "text-red-brand bg-red-brand/10",
  pptx: "text-amber-700 bg-amber-brand/15",
  docx: "text-indigo-brand bg-indigo-brand/10",
};

function getDocumentSamplePreview(doc: AppDocument, subjectName: string) {
  return {
    samplePassage: `[Extracted ${doc.fileType.toUpperCase()} Content Preview]: Key theoretical concepts and structured explanations for ${doc.topicTag || subjectName}. This material covers core algorithms, architecture diagrams, and worked examples for Semester ${doc.semester} students.`,
    extractedPassagesCount: 12,
    qualityMetrics: {
      syllabusAlignment: 96,
      readabilityScore: "High",
      boilerplateFiltered: true,
      hallucinationRisk: "Low (< 4%)",
    },
  };
}

function ApprovalsPage() {
  const { documents, subjects, modules, multiModalChunks, approveDocument, rejectDocument } = useAppData();
  const [justActed, setJustActed] = useState<Record<string, "approved" | "rejected">>({});
  const [inspectDoc, setInspectDoc] = useState<AppDocument | null>(null);
  const [viewPdfDoc, setViewPdfDoc] = useState<AppDocument | null>(null);

  const pending = documents.filter((d) => d.status === "pending");

  const handleApprove = (id: string) => {
    approveDocument(id);
    setJustActed((p) => ({ ...p, [id]: "approved" }));
    if (inspectDoc?.id === id) setInspectDoc(null);
  };

  const handleReject = (id: string) => {
    rejectDocument(id);
    setJustActed((p) => ({ ...p, [id]: "rejected" }));
    if (inspectDoc?.id === id) setInspectDoc(null);
  };

  return (
    <div>
      <PageHeader
        title="Content Approval & Moderation"
        subtitle={`${pending.length} faculty submission${pending.length !== 1 ? "s" : ""} awaiting review and vector store indexing.`}
      />

      {pending.length === 0 && documents.filter(d => d.status !== "pending").length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700">
          <Check className="h-5 w-5 shrink-0" />
          All faculty submissions have been reviewed. Queue is completely clear.
        </div>
      )}

      <Card>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-brand/10 text-green-brand">
              <Check className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-800">Queue is clear</div>
            <p className="mt-1 text-sm text-slate-500">No pending documents to review.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pending.map((d) => {
              const subj = subjects.find((s) => s.id === d.subjectId);
              const mod  = modules.find((m) => m.id === d.moduleId);
              const Icon = FILE_ICONS[d.fileType];
              const acted = justActed[d.id];
              return (
                <li key={d.id} className={cn(
                  "flex items-center justify-between gap-4 py-4 transition-all",
                  acted ? "opacity-50" : ""
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", FILE_COLORS[d.fileType])}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{d.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <Pill tone="indigo">{subj?.name ?? d.subjectId}</Pill>
                        <span>Submitted by <strong className="text-slate-700">{d.uploadedByName ?? d.uploadedBy}</strong></span>
                        <span>·</span>
                        <span className="capitalize font-semibold">{d.fileType.toUpperCase()}</span>
                        <span>·</span>
                        <span className="capitalize">{d.difficulty} difficulty</span>
                        <span>·</span>
                        <span>Sem {d.semester}</span>
                        {d.topicTag && <><span>·</span><span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{d.topicTag}</span></>}
                      </div>
                    </div>
                  </div>

                  {acted ? (
                    <Pill tone={acted === "approved" ? "green" : "red"}>
                      {acted === "approved" ? "Approved ✓" : "Rejected ✗"}
                    </Pill>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewPdfDoc(d)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        title="View page-by-page document"
                      >
                        <BookOpen className="h-4 w-4 text-indigo-brand" /> View Document
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectDoc(d)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-brand/30 bg-indigo-brand/5 px-3 py-2 text-xs font-semibold text-indigo-brand hover:bg-indigo-brand/10 transition"
                      >
                        <Eye className="h-4 w-4" /> Inspect Audit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(d.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(d.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-red-brand ring-1 ring-red-brand/30 hover:bg-red-brand/5 transition"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ── Document Content Inspector Modal ── */}
      {inspectDoc && (() => {
        const subj = subjects.find((s) => s.id === inspectDoc.subjectId);
        const mod  = modules.find((m) => m.id === inspectDoc.moduleId);
        const preview = getDocumentSamplePreview(inspectDoc, subj?.name ?? "CSE Subject");
        const Icon = FILE_ICONS[inspectDoc.fileType];
        const docChunks = multiModalChunks.filter((c) => c.docId === inspectDoc.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden space-y-4">

              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", FILE_COLORS[inspectDoc.fileType])}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="font-serif text-lg font-bold text-slate-900">{inspectDoc.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      Submitted by <span className="font-semibold text-slate-700">{inspectDoc.uploadedByName ?? inspectDoc.uploadedBy}</span> on {inspectDoc.uploadDate}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="rounded-lg text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 space-y-5">
                <div className="flex justify-between items-center bg-indigo-brand/10 p-3 rounded-xl">
                  <span className="text-xs font-semibold text-indigo-brand">Want to read the full multi-page document file?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = inspectDoc;
                      setInspectDoc(null);
                      setViewPdfDoc(d);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-indigo-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-brand-hover"
                  >
                    <BookOpen className="h-3.5 w-3.5" /> Read Full Document Pages
                  </button>
                </div>

                {/* Metadata Summary Chips */}
                <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Subject</div>
                    <div className="mt-1 font-bold text-slate-900 truncate">{subj?.name ?? inspectDoc.subjectId}</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Module / Unit</div>
                    <div className="mt-1 font-bold text-slate-900 truncate">{mod?.name ?? "General"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Topic Tag</div>
                    <div className="mt-1 font-bold text-indigo-brand">{inspectDoc.topicTag || "Not specified"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Difficulty</div>
                    <div className="mt-1 font-bold capitalize text-amber-700">{inspectDoc.difficulty}</div>
                  </div>
                </div>

                {/* AI Quality & Moderation Checks */}
                <div className="rounded-2xl border border-indigo-brand/20 bg-indigo-brand/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-brand uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> AI Content Compliance & Moderation Audit
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
                    <div className="rounded-lg bg-white p-2.5 shadow-2xs">
                      <div className="text-[10px] text-slate-400">Syllabus Match</div>
                      <div className="text-sm font-bold text-green-600">{preview.qualityMetrics.syllabusAlignment}% Alignment</div>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 shadow-2xs">
                      <div className="text-[10px] text-slate-400">Boilerplate Filter</div>
                      <div className="text-sm font-bold text-slate-700">Clean ✓</div>
                    </div>
                    <div className="rounded-lg bg-white p-2.5 shadow-2xs">
                      <div className="text-[10px] text-slate-400">Hallucination Risk</div>
                      <div className="text-sm font-bold text-indigo-brand">{preview.qualityMetrics.hallucinationRisk}</div>
                    </div>
                  </div>
                </div>

                {/* Extracted Text Content Sample */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-brand" /> Extracted Text Passages & Context
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 font-sans max-h-40 overflow-y-auto">
                    {preview.samplePassage}
                  </div>
                </div>
              </div>

              {/* Modal Moderation Actions Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 p-6 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Close Inspection
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(inspectDoc.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-red-brand ring-1 ring-red-brand/30 hover:bg-red-brand/5 transition"
                  >
                    <X className="h-4 w-4" /> Reject Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(inspectDoc.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-brand px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition shadow-sm"
                  >
                    <Check className="h-4 w-4" /> Approve & Index into Vector Store
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Document Viewer Modal ── */}
      {viewPdfDoc && (
        <DocumentViewerModal
          docName={viewPdfDoc.name}
          fileType={viewPdfDoc.fileType}
          subjectName={subjects.find((s) => s.id === viewPdfDoc.subjectId)?.name ?? "CSE Subject"}
          uploadedBy={viewPdfDoc.uploadedByName ?? viewPdfDoc.uploadedBy}
          uploadDate={viewPdfDoc.uploadDate}
          onClose={() => setViewPdfDoc(null)}
        />
      )}
    </div>
  );
}
