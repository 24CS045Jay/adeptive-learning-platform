import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { PageHeader, Card, Pill, EmptyState, PrimaryButton } from "@/components/app-shell";
import { weakTopics } from "@/lib/mock-data";

export const Route = createFileRoute("/student/planner")({
  component: Planner,
});

function Planner() {
  return (
    <div>
      <PageHeader title="Study Planner" subtitle="A revision plan generated from your weakest topics — prioritize these before your next exam." />
      <Card>
        {weakTopics.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing to plan yet" description="Take a few quizzes so we can identify topics worth revising." />
        ) : (
          <ol className="space-y-3">
            {weakTopics.map((w, i) => (
              <li key={w.topic} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-brand text-sm font-bold text-white">{i + 1}</div>
                  <div>
                    <div className="font-medium text-slate-900">{w.topic}</div>
                    <div className="text-xs text-slate-500">{w.reason}</div>
                    <div className="mt-1"><Pill tone="indigo">{w.subject}</Pill></div>
                  </div>
                </div>
                <PrimaryButton>Review with Tutor</PrimaryButton>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
