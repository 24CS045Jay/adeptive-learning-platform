import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Plus } from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { quizzes } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/quizzes")({
  component: QuizManager,
});

function QuizManager() {
  return (
    <div>
      <PageHeader title="Quiz Manager" subtitle="Create and edit quizzes for your subjects." action={<PrimaryButton icon={Sparkles}>Auto-generate quiz</PrimaryButton>} />
      <Card>
        <ul className="divide-y divide-slate-100">
          {quizzes.map((q) => (
            <li key={q.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-medium text-slate-900">{q.subject}</div>
                <div className="mt-1 text-xs text-slate-500">{q.questions} questions</div>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone="indigo">Active</Pill>
                <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3 w-3" /> Add question</button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
