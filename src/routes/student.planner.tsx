import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Target, Check, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/planner")({
  component: Planner,
});

interface TopicRemediation {
  topic: string;
  subject: string;
  reason: string;
  status: "pending" | "completed";
  priority: "high" | "medium" | "low";
  estMinutes: number;
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
    priority: "high",
    estMinutes: 20,
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
    priority: "high",
    estMinutes: 15,
    summary: {
      keyConcept: "L1 (Lasso) adds absolute weight penalty |w| inducing sparsity. L2 (Ridge) adds squared weight penalty w^2 shrinking weights smoothly.",
      formulasOrCode: "Loss_L1 = MSE + λ ∑ |w_i|\nLoss_L2 = MSE + λ ∑ (w_i)^2",
      commonPitfall: "Confusing L1 (feature selection) with L2 (prevents large weights without zeroing them out).",
    },
  },
  {
    topic: "Speculative Execution",
    subject: "Big Data Analytics",
    reason: "Missed spec task trigger condition",
    status: "completed",
    priority: "medium",
    estMinutes: 10,
    summary: {
      keyConcept: "Hadoop launches duplicate tasks for slow worker nodes ('stragglers'). The first copy to complete is accepted; the redundant one is killed.",
      formulasOrCode: "Trigger condition: Task execution progress < 0.2 * cluster average progress rate.",
      commonPitfall: "Assuming speculative execution handles node crashes. It handles stragglers; Heartbeat timeouts handle crashes.",
    },
  },
];

const TOTAL_WEEKLY_GOAL = 8;

/* ── Enhanced Confetti Burst (20 particles) ── */
function ConfettiBurst() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * 360,
    color: i % 4 === 0 ? "#8b5cf6" : i % 4 === 1 ? "#f5c451" : i % 4 === 2 ? "#34d399" : "#fb7185",
    size: 4 + (i % 3) * 2,
    speed: 24 + (i % 5) * 6,
    rotSpeed: 120 + (i % 3) * 60,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            scale: [0, 1, 0.6, 0],
            x: Math.cos((d.angle * Math.PI) / 180) * d.speed,
            y: Math.sin((d.angle * Math.PI) / 180) * d.speed,
            opacity: [1, 1, 0.5, 0],
            rotate: d.rotSpeed,
          }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{ width: d.size, height: d.size, background: d.color }}
        />
      ))}
    </div>
  );
}

/* ── Priority Badge ── */
function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles = {
    high:   "bg-danger/10 text-danger border border-danger/20",
    medium: "bg-gold/10 text-gold border border-gold/20",
    low:    "bg-success/10 text-success border border-success/20",
  };
  const labels = { high: "High Priority", medium: "Medium", low: "Low" };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", styles[priority])}>
      {labels[priority]}
    </span>
  );
}

function Planner() {
  const [items, setItems] = useState<TopicRemediation[]>(SAMPLE_REMEDIATIONS);
  const [inspectItem, setInspectItem] = useState<TopicRemediation | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  const pendingCount   = items.filter((i) => i.status === "pending").length;
  const completedCount = items.filter((i) => i.status === "completed").length;
  const weeklyRevised  = Math.min(completedCount, TOTAL_WEEKLY_GOAL);
  const progressPct    = Math.round((weeklyRevised / TOTAL_WEEKLY_GOAL) * 100);
  const isAllDone      = progressPct >= 100;

  const toggleStatus = (topicName: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.topic !== topicName) return i;
        const next = i.status === "pending" ? "completed" : "pending";
        if (next === "completed") setBurstId(topicName);
        return { ...i, status: next };
      })
    );
    setTimeout(() => setBurstId(null), 700);
  };

  return (
    <div>
      <PageHeader
        title="AI Personal Study Planner & Remediation"
        subtitle="Dynamic revision schedule generated from your quiz weak points — prioritize these before your end-semester exam."
        action={
          <div className="flex items-center gap-3 rounded-xl border border-violet/20 bg-violet/5 px-4 py-2 text-xs font-bold text-violet">
            <Target className="h-4 w-4" /> Mid-Semester Exam: 12 Days Left
          </div>
        }
      />

      {/* Progress Card */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 transition-all"
        style={isAllDone ? { borderColor: "oklch(0.75 0.17 160 / 40%)", background: "color-mix(in oklch, var(--color-success) 4%, var(--color-card) 96%)" } : {}}>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground flex items-center gap-2">
            {isAllDone && <Trophy className="h-4 w-4 text-gold" />}
            {isAllDone ? "🎉 All topics mastered this week!" : `${weeklyRevised} of ${TOTAL_WEEKLY_GOAL} topics revised this week`}
          </span>
          <span className={cn("font-bold text-base tabular-nums", isAllDone ? "text-success" : "text-violet")}>
            {progressPct}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={cn("h-full rounded-full", isAllDone ? "progress-gradient-success" : "progress-gradient-violet")}
          />
        </div>
        <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
          <span>{completedCount} completed</span>
          <span>·</span>
          <span>{pendingCount} remaining</span>
          <span>·</span>
          <span>~{items.filter(i => i.status === "pending").reduce((a, i) => a + i.estMinutes, 0)} min to go</span>
        </div>
      </div>

      {/* Stat mini-cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-gold/30 hover:shadow-[0_4px_16px_-4px_oklch(0.82_0.18_84_/_25%)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Needs Revision</div>
          <div className="mt-2 text-3xl font-bold text-gradient-gold tabular-nums">{pendingCount} Topics</div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-success/30 hover:shadow-[0_4px_16px_-4px_oklch(0.75_0.17_160_/_25%)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revised & Mastered</div>
          <div className="mt-2 text-3xl font-bold text-gradient-success tabular-nums">{completedCount} Topics</div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-violet/30 hover:shadow-[0_4px_16px_-4px_oklch(0.62_0.22_293_/_25%)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Remediation Mastery</div>
          <div className="mt-2 text-3xl font-bold text-gradient-violet tabular-nums">{Math.round((completedCount / items.length) * 100)}%</div>
        </motion.div>
      </div>

      <Card>
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.topic}
              layout
              className={cn(
                "relative flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all",
                item.status === "completed"
                  ? "border-success/20 bg-success/5 opacity-75"
                  : "border-border bg-background hover:border-violet/25 hover:shadow-[0_2px_12px_-4px_oklch(0.62_0.22_293_/_15%)]"
              )}
            >
              {burstId === item.topic && <ConfettiBurst />}

              <div className="flex items-start gap-3.5 min-w-0">
                <motion.button
                  type="button"
                  onClick={() => toggleStatus(item.topic)}
                  whileTap={{ scale: 0.8 }}
                  className={cn(
                    "relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                    item.status === "completed"
                      ? "bg-success text-white shadow-[0_0_10px_-2px_oklch(0.75_0.17_160_/_45%)]"
                      : "border-2 border-border text-transparent hover:border-success hover:shadow-[0_0_8px_-2px_oklch(0.75_0.17_160_/_30%)]"
                  )}
                  title="Toggle complete"
                >
                  <AnimatePresence mode="wait">
                    {item.status === "completed" && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <div className="min-w-0">
                  <div className={cn(
                    "font-semibold text-foreground transition-all",
                    item.status === "completed" && "line-through text-muted-foreground"
                  )}>
                    {item.topic}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Pill tone="indigo">{item.subject}</Pill>
                    <PriorityBadge priority={item.priority} />
                    <span className="text-muted-foreground">Est. {item.estMinutes} min</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Reason: {item.reason}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectItem(item)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-violet/25 bg-violet/5 px-3.5 py-2 text-xs font-semibold text-violet transition hover:bg-violet/12 hover:border-violet/40 hover:shadow-[0_0_12px_-3px_oklch(0.62_0.22_293_/_30%)]"
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Revision Summary
              </button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Summary Modal */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 14 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
              style={{ boxShadow: "0 24px 64px -16px rgba(0,0,0,0.45), 0 0 0 1px var(--color-border)" }}
            >
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
                    <Sparkles className="h-5 w-5 text-violet" /> {inspectItem.topic}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{inspectItem.subject} · AI Remediation Guide</div>
                </div>
                <button type="button" onClick={() => setInspectItem(null)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition text-lg leading-none">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="rounded-xl border border-violet/20 bg-violet/5 p-3.5 space-y-1">
                  <div className="font-bold text-violet uppercase text-[10px] tracking-wider">Core Concept Breakdown</div>
                  <p className="text-foreground font-sans">{inspectItem.summary.keyConcept}</p>
                </div>

                <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                  <div className="font-bold text-violet uppercase text-[10px] tracking-wider">Key Formula / Execution Rule</div>
                  <pre className="text-foreground font-mono text-[11px] whitespace-pre-wrap opacity-90">{inspectItem.summary.formulasOrCode}</pre>
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-3.5 space-y-1">
                  <div className="font-bold text-gold uppercase text-[10px] tracking-wider flex items-center gap-1">
                    ⚠ Common Exam Pitfall to Avoid
                  </div>
                  <p className="text-foreground font-sans">{inspectItem.summary.commonPitfall}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => { toggleStatus(inspectItem.topic); setInspectItem(null); }}
                  className="rounded-xl bg-gradient-to-r from-success to-[#10b981] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 shadow-[0_0_12px_-3px_oklch(0.75_0.17_160_/_40%)]"
                >
                  Mark Topic as Mastered ✓
                </button>
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition"
                >
                  Close Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
