import { useState } from "react";
import {
  Star, FileText, Layers, AlertCircle, CheckCircle2, ShieldAlert,
  Eye, Edit3, Image as ImageIcon, Sparkles, Filter, X,
} from "lucide-react";
import { Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import type { MultiModalChunk } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PassageWorkbenchModal({
  docId,
  docName,
  onClose,
}: {
  docId: string;
  docName: string;
  onClose: () => void;
}) {
  const { multiModalChunks, updateChunkWeight, toggleChunkStatus } = useAppData();

  const docChunks = multiModalChunks.filter(
    (c) => c.docId === docId || c.docName === docName
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-card shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-accent/40">
          <div>
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
              <Layers className="h-5 w-5 text-violet" /> Passage Inspection & Reranking Workbench
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Document: <span className="font-semibold text-foreground">{docName}</span> · {docChunks.length} multi-modal chunks indexed
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-slate-200 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {docChunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Layers className="h-10 w-10 text-slate-300 mb-2" />
              <div className="font-semibold text-foreground">No multi-modal chunks extracted yet</div>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Passages and visual artifacts will be indexed automatically when processed by the vector pipeline.
              </p>
            </div>
          ) : (
            docChunks.map((c, i) => (
              <div
                key={c.id}
                className={cn(
                  "rounded-2xl border p-5 transition-all space-y-3",
                  c.status === "deprecated"
                    ? "border-red-200 bg-red-50/40 opacity-75"
                    : "border-border bg-card shadow-xs"
                )}
              >
                {/* Top Row: Chunk #, Unit/Page, Status, Star Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-brand/10 text-xs font-bold text-violet">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-foreground">{c.unit}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">Page/Slide {c.pageOrSlide}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Star Weight Reranking */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground mr-1">Rerank Weight:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateChunkWeight(c.id, star)}
                          className={cn(
                            "p-0.5 transition hover:scale-125",
                            star <= c.weight ? "text-amber-400 fill-amber-400" : "text-slate-300"
                          )}
                          title={`Set priority weight to ${star} stars`}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      ))}
                    </div>

                    {/* Active vs Deprecated Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleChunkStatus(c.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        c.status === "active"
                          ? "bg-green-brand/10 text-green-700 hover:bg-red-brand/10 hover:text-red-700"
                          : "bg-red-brand/10 text-red-700 hover:bg-green-brand/10 hover:text-green-700"
                      )}
                    >
                      {c.status === "active" ? "Active in RAG ✓" : "Out of Syllabus ✗"}
                    </button>
                  </div>
                </div>

                {/* Text Content */}
                <p className="text-sm leading-relaxed text-foreground font-sans">
                  "{c.text}"
                </p>

                {/* Extracted Visual Artifact Thumbnail */}
                {c.artifact && (
                  <div className="rounded-xl border border-violet/20 bg-indigo-brand/5 p-3.5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-brand text-white font-bold">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-foreground">{c.artifact.title}</span>
                        <span className="rounded bg-indigo-brand/15 px-2 py-0.5 text-[10px] font-bold text-violet">
                          {c.artifact.badge}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground italic">
                        {c.artifact.caption}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-accent/40">
          <div className="text-xs text-muted-foreground">
            Changes to weights and status are updated in real-time in the vector reranker.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-brand px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-brand-hover shadow-sm"
          >
            Done Reranking
          </button>
        </div>

      </div>
    </div>
  );
}
