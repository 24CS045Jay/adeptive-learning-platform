import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { quizzes } from "@/lib/mock-data";

export const Route = createFileRoute("/student/quizzes")({
  component: Quizzes,
});

function Quizzes() {
  return (
    <div>
      <PageHeader title="Quizzes" subtitle="Self-assess your understanding, one subject at a time." />
      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((q) => (
          <Card key={q.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-brand/15 text-amber-brand"><ListChecks className="h-4 w-4" /></div>
                  <div className="font-serif text-lg font-bold text-slate-900">{q.subject}</div>
                </div>
                <div className="mt-2 text-sm text-slate-500">{q.questions} questions</div>
                <div className="mt-1 text-xs text-slate-400">Best score: {q.bestScore != null ? `${q.bestScore}%` : "—"}</div>
              </div>
              <Pill tone={q.bestScore == null ? "slate" : q.bestScore > 70 ? "green" : "amber"}>
                {q.bestScore == null ? "Not attempted" : q.bestScore > 70 ? "Strong" : "Needs work"}
              </Pill>
            </div>
            <div className="mt-4"><PrimaryButton>Start quiz</PrimaryButton></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
