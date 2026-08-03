import { useState } from "react";
import {
  FileText, Presentation, FileType2, X, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Download, CheckCircle2, ShieldCheck, Layers, BookOpen,
} from "lucide-react";
import type { FileType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface DocumentViewerProps {
  docName: string;
  fileType: FileType;
  subjectName?: string;
  uploadedBy?: string;
  uploadDate?: string;
  totalPages?: number;
  onClose: () => void;
}

const SAMPLE_PAGES: Record<string, string[]> = {
  pdf: [
    "--- PAGE 1 ---\n\nCHARUSAT UNIVERSITY — CSPIT COMPUTER ENGINEERING\nSubject: Big Data Analytics (CSE501)\n\nUNIT 1: MAPREDUCE & HDFS ARCHITECTURE\n\n1.1 Introduction to Distributed Computing\nDistributed computing enables the processing of massive datasets across clusters of commodity hardware. Hadoop MapReduce provides a fault-tolerant software framework for writing applications that process vast amounts of data in parallel on large clusters in a reliable, fault-tolerant manner.\n\n1.2 HDFS Master-Slave Architecture\nHDFS consists of a single NameNode (Master) and multiple DataNodes (Workers). The NameNode manages file system metadata, directory tree structures, and block mappings in RAM.",

    "--- PAGE 2 ---\n\n1.3 MapReduce Job Execution Lifecycle\n\nExecution steps:\n1. Input Splitting: Input files are split into 128MB chunks.\n2. Map Phase: Map functions process input key-value pairs and generate intermediate pairs.\n3. Shuffle & Sort: Framework sorts intermediate key-value pairs and transfers them over the network to reducers.\n4. Reduce Phase: Reducer aggregates intermediate values for each unique key.\n\nFigure 1.2: MapReduce Dataflow Architecture\n[ Input Splits → Mappers → Local Disk → Shuffle & Sort → Reducers → HDFS Output ]",

    "--- PAGE 3 ---\n\n1.4 Speculative Execution & Fault Tolerance\n\nIf a node runs slowly (a 'straggler'), Hadoop launches a duplicate speculative task on another node. Whichever task finishes first is retained, and the redundant task is killed.\n\n1.5 Review Questions for Semester Exam:\nQ1. Describe the role of NameNode and DataNode in HDFS.\nQ2. Explain the shuffle and sort phase in detail with a diagram.",
  ],
  pptx: [
    "--- SLIDE 1 (Title Slide) ---\n\nCLOUD COMPUTING & CONTAINERS\nUnit 2 — Virtualization vs Containerization\nInstructor: Prof. Anil Kumar\n\nSpeaker Notes:\nWelcome students. Today we compare hypervisor-based virtual machines with Docker kernel namespaces.",

    "--- SLIDE 2 ---\n\nCONTAINER ARCHITECTURE\n• Host OS Kernel shared across containers\n• Namespaces: PID, NET, IPC, MNT isolation\n• CGroups: Resource limit constraints (CPU, RAM)\n• Sub-second container startup duration\n\nSpeaker Notes:\nPoint out that unlike VMs, containers do not bundle a full guest OS.",
  ],
  docx: [
    "--- SECTION 1 ---\n\nMACHINE LEARNING LECTURE NOTES — SUPERVISED LEARNING\n\nSummary of Algorithms:\n• Linear Regression: y = w^T * x + b (L2 regularization: Ridge, L1: Lasso)\n• Logistic Regression: p = 1 / (1 + e^(-z))\n• Decision Trees: Split based on Information Gain (Entropy reduction)\n\nTable 1: Algorithm Comparison Matrix\n[ Linear Reg: Fast, Low Variance | Decision Tree: Non-linear, High Variance ]",
  ],
};

export function DocumentViewerModal({
  docName,
  fileType,
  subjectName = "Big Data Analytics",
  uploadedBy = "Dr. Nisha Shah",
  uploadDate = "2026-07-20",
  totalPages = 3,
  onClose,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom]               = useState<number>(100);

  const pages = SAMPLE_PAGES[fileType] ?? SAMPLE_PAGES.pdf;
  const pageContent = pages[Math.min(currentPage - 1, pages.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl bg-card shadow-2xl overflow-hidden">

        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold">
              {fileType === "pdf" ? <FileText className="h-5 w-5" /> : fileType === "pptx" ? <Presentation className="h-5 w-5" /> : <FileType2 className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <div className="font-serif text-base font-bold truncate">{docName}</div>
              <div className="text-xs text-muted-foreground truncate">
                {subjectName} · {uploadedBy} · {uploadDate}
              </div>
            </div>
          </div>

          {/* Controls: Page Navigation + Zoom + Actions */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Page Nav */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1 text-xs">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-muted-foreground hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Page {currentPage} of {pages.length}</span>
              <button
                type="button"
                disabled={currentPage >= pages.length}
                onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
                className="text-muted-foreground hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 15))}
                className="p-1 hover:text-white"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-mono">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 15))}
                className="p-1 hover:text-white"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 p-1.5 text-muted-foreground hover:bg-slate-700 hover:text-white transition"
              title="Close viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Page Reader Canvas */}
        <div className="flex-1 bg-muted p-6 overflow-auto flex justify-center items-start">
          <div
            style={{ width: `${zoom}%` }}
            className="w-full max-w-3xl min-h-[600px] rounded-xl bg-card p-10 shadow-lg border border-border transition-all font-serif text-foreground leading-relaxed whitespace-pre-line space-y-4"
          >
            {/* Watermark header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4 text-xs font-sans text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-violet">
                CHARUSAT CSE · Official Course Document
              </span>
              <span>{fileType.toUpperCase()} Format</span>
            </div>

            {/* Rendered Text Content */}
            <div className="text-sm font-sans leading-relaxed">
              {pageContent}
            </div>

            {/* Simulated Page Footer */}
            <div className="pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-sans">
              <span>Verified for AI Tutor Vector Store</span>
              <span>Page {currentPage}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Extracted text chunks verified & synced with RAG pipeline.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
