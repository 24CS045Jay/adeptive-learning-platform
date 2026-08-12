import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Plus, Trash2, BookOpen, CheckCircle2, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import {
  INITIAL_QUIZZES,
  generateQuizFromDoc,
  type Quiz,
} from "@/lib/quiz-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/quizzes")({
  component: QuizManager,
});

function QuizManager() {
  const { documents, subjects, quizzes: contextQuizzes } = useAppData();

  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);

  const approvedDocs = documents.filter((d) => d.status === "approved");

  // Auto-generate Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(approvedDocs[0]?.id ?? "");
  const [isGenerating, setIsGenerating]   = useState(false);
  const [generatedBanner, setGeneratedBanner] = useState(false);

  // Expand quiz state
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const saveQuizzesToStore = (newList: Quiz[]) => {
    setQuizzes(newList);
  };

  const handleGenerate = async () => {
    const doc = approvedDocs.find((d) => d.id === selectedDocId) ?? approvedDocs[0];
    if (!doc) return;

    const subj = subjects.find((s) => s.id === doc.subjectId);

    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newQuiz = generateQuizFromDoc(doc.name, subj?.name ?? "Big Data Analytics", doc.uploadedByName ?? "Dr. Nisha Shah");

    saveQuizzesToStore([newQuiz, ...quizzes]);

    setIsGenerating(false);
    setShowGenModal(false);
    setGeneratedBanner(true);
    setTimeout(() => setGeneratedBanner(false), 3500);
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      saveQuizzesToStore(quizzes.filter((q) => q.id !== id));
    }
  };

  return (
    <div>
      <PageHeader
        title="Quiz Manager & Auto-Generator"
        subtitle="Auto-generate adaptive quizzes from vector store document chunks or manage subject assessments."
        action={
          <PrimaryButton icon={Sparkles} onClick={() => setShowGenModal(true)}>
            Auto-generate Quiz from Doc
          </PrimaryButton>
        }
      />

      {generatedBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-success/5 px-6 py-4 text-sm text-success font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Quiz auto-generated and published to students! Available now on student portal.
        </div>
      )}

      {/* ── Quizzes List ── */}
      <div className="space-y-4">
        {quizzes.map((q) => {
          const isExpanded = expandedQuizId === q.id;
          return (
            <Card key={q.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-brand/15 text-gold">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-lg font-bold text-foreground truncate">{q.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {q.subjectName} · {q.totalQuestions} Questions · Created by {q.createdBy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Pill tone="green">Published</Pill>
                  <button
                    type="button"
                    onClick={() => setExpandedQuizId(isExpanded ? null : q.id)}
                    className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent/40"
                  >
                    {isExpanded ? "Hide Questions" : "Inspect Questions"}
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="text-slate-300 hover:text-red-brand transition p-1"
                    title="Delete quiz"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Questions List */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Extracted Vector Questions ({q.questions.length})
                  </div>
                  {q.questions.map((qn, idx) => (
                    <div key={qn.id} className="rounded-xl border border-border bg-accent/40 p-3.5 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>Q{idx + 1}. {qn.prompt}</span>
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 uppercase">
                          {qn.type} · {qn.difficulty}
                        </span>
                      </div>
                      {qn.codeSnippet && (
                        <pre className="rounded-lg bg-slate-900 p-2 text-[11px] text-indigo-300 font-mono overflow-x-auto">
                          {qn.codeSnippet}
                        </pre>
                      )}
                      <div className="text-muted-foreground">
                        <span className="font-semibold text-success">Answer / Explanation:</span> {qn.explanation}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Cited Source: {qn.sourceDoc} (Page {qn.sourcePage})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Auto Generate Quiz Modal ── */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-foreground">
                <Sparkles className="h-5 w-5 text-violet" /> Auto-Generate Quiz from Document
              </div>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Source Document (Vector Store)
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-violet font-medium"
                >
                  {approvedDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.fileType.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-violet/20 bg-indigo-brand/5 p-3.5 text-xs text-violet leading-relaxed">
                The RAG pipeline will parse extracted text passages, formula matrices, and visual diagrams from this document to synthesize 5 adaptive questions (MCQ + Code + Conceptual Short Answer).
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl bg-violet px-5 py-2 text-sm font-semibold text-white hover:bg-violet-hover shadow-sm disabled:opacity-50"
              >
                {isGenerating ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Generating Quiz…" : "Generate & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
