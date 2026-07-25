import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarClock, CheckCircle2, Sparkles, BookOpen, AlertTriangle,
  ArrowRight, Clock, Target, Check, RotateCcw,
} from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton, EmptyState } from "@/components/app-shell";
import { weakTopics as initialWeakTopics } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/planner")({
  component: Planner,
});

interface TopicRemediation {
  topic: string;
  subject: string;
  reason: string;
  status: "pending" | "completed";
  summary: {
    keyConcept: string;
    formulasOrCode: string;
    commonPitfall: string;
  };
}

const SAMPLE_REMEDIATIONS: TopicRemediation[] = [
  {
    topic: "MapReduce Shuffle & Sort",
    subject: "Big Data Analytics",
    reason: "Low accuracy on Unit 1 quiz questions",
    status: "pending",
    summary: {
      keyConcept: "Shuffle phase transfers intermediate map outputs over the network to reducers. Map output is partitioned by key hash modulo reducer count.",
      formulasOrCode: "partition = hash(key) % numReducers\nSort: Key-Value pairs sorted in memory buffer (100MB) before spill to disk.",
      commonPitfall: "Forgetting that Combiners run locally on Mappers, not on Reducers. Combiners must be commutative and associative.",
    },
  },
  {
    topic: "L1 vs L2 Regularization",
    subject: "Machine Learning",
    reason: "Struggled on question 2 in Supervised Learning assessment",
    status: "pending",
    summary: {
      keyConcept: "L1 (Lasso) adds absolute weight penalty |w| inducing sparsity (zero weights). L2 (Ridge) adds squared weight penalty w^2 shrinking weights smoothly.",
      formulasOrCode: "Loss_L1 = MSE + λ ∑ |w_i|\nLoss_L2 = MSE + λ ∑ (w_i)^2",
      commonPitfall: "Confusing L1 (feature selection) with L2 (prevents large weights without setting them to zero).",
    },
  },
  {
    topic: "Speculative Execution",
    subject: "Big Data Analytics",
    reason: "Missed spec task trigger condition",
    status: "completed",
    summary: {
      keyConcept: "Hadoop launches duplicate tasks for slow worker nodes ('stragglers') on alternative nodes. The first copy to complete is accepted and the redundant copy is killed.",
      formulasOrCode: "Trigger condition: Task execution progress < 0.2 * cluster average progress rate.",
      commonPitfall: "Assuming speculative execution handles node crashes. It handles stragglers (slow tasks), while Heartbeat timeouts handle node crashes.",
    },
  },
];

function Planner() {
  const [items, setItems] = useState<TopicRemediation[]>(SAMPLE_REMEDIATIONS);
  const [inspectItem, setInspectItem] = useState<TopicRemediation | null>(null);

  const pendingCount   = items.filter((i) => i.status === "pending").length;
  const completedCount = items.filter((i) => i.status === "completed").length;

  const toggleStatus = (topicName: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.topic === topicName
          ? { ...i, status: i.status === "pending" ? "completed" : "pending" }
          : i
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="AI Personal Study Planner & Remediation"
        subtitle="Dynamic revision schedule generated from your quiz weak points — prioritize these before your end-semester exam."
        action={
          <div className="flex items-center gap-3 rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 px-4 py-2 text-xs font-bold text-indigo-brand">
            <Target className="h-4 w-4 text-indigo-brand" /> Mid-Semester Exam: 12 Days Left
          </div>
        }
      />

      {/* Progress Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Topics Needing Revision</div>
          <div className="mt-2 text-3xl font-bold text-amber-brand">{pendingCount} Topics</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Revised & Mastered</div>
          <div className="mt-2 text-3xl font-bold text-green-brand">{completedCount} Topics</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Remediation Mastery</div>
          <div className="mt-2 text-3xl font-bold text-indigo-brand">
            {Math.round((completedCount / items.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Weak Topics Revision List */}
      <Card>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.topic}
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all",
                item.status === "completed"
                  ? "border-green-200 bg-green-50/40 opacity-80"
                  : "border-slate-200 bg-white hover:border-indigo-brand/40 shadow-2xs"
              )}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleStatus(item.topic)}
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                    item.status === "completed"
                      ? "bg-green-600 text-white"
                      : "border border-slate-300 text-transparent hover:border-green-600"
                  )}
                  title="Toggle complete"
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <div className={cn("font-semibold text-slate-900", item.status === "completed" && "line-through text-slate-500")}>
                    {item.topic}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Pill tone="indigo">{item.subject}</Pill>
                    <span>Reason: {item.reason}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectItem(item)}
                  className="flex items-center gap-1.5 rounded-xl border border-indigo-brand/30 bg-indigo-brand/5 px-3.5 py-2 text-xs font-semibold text-indigo-brand hover:bg-indigo-brand/10 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI Revision Summary
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Revision Summary Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
                  <Sparkles className="h-5 w-5 text-indigo-brand" /> {inspectItem.topic}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{inspectItem.subject} · AI Remediation Guide</div>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {/* Key Concept Breakdown */}
              <div className="rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 p-3.5 space-y-1">
                <div className="font-bold text-indigo-brand uppercase text-[10px] tracking-wider">Core Concept Breakdown</div>
                <p className="text-slate-700 font-sans">{inspectItem.summary.keyConcept}</p>
              </div>

              {/* Formulas or Code */}
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 space-y-1">
                <div className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">Key Formula / Execution Rule</div>
                <pre className="text-indigo-200 font-mono text-[11px] whitespace-pre-wrap">{inspectItem.summary.formulasOrCode}</pre>
              </div>

              {/* Common Exam Pitfall */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-1 text-amber-800">
                <div className="font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Common Exam Pitfall to Avoid
                </div>
                <p className="font-sans">{inspectItem.summary.commonPitfall}</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  toggleStatus(inspectItem.topic);
                  setInspectItem(null);
                }}
                className="rounded-xl bg-green-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition"
              >
                Mark Topic as Mastered ✓
              </button>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
