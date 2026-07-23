import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, ListChecks, TrendingDown } from "lucide-react";
import { PageHeader, StatCard, ActionCard, Card, EmptyState, Pill } from "@/components/app-shell";
import { weakTopics } from "@/lib/mock-data";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <div>
      <PageHeader title="Your Learning Dashboard" subtitle="Personalized progress across all subjects." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Questions Asked" value={42} color="indigo" />
        <StatCard label="Quiz Attempts" value={8} color="amber" />
        <StatCard label="Quiz Accuracy" value="74%" color="green" />
        <StatCard label="Weak Topics" value={weakTopics.length} color="teal" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActionCard icon={MessageCircle} title="Ask the AI Tutor" description="Get grounded answers from your course material." color="indigo" />
        <ActionCard icon={ListChecks} title="Take a Quiz" description="Self-assess and build your mastery score." color="amber" />
      </div>
      <div className="mt-6">
        <Card title="Weak Topics — Suggested Revision" action={<TrendingDown className="h-5 w-5 text-red-brand" />}>
          {weakTopics.length === 0 ? (
            <EmptyState icon={TrendingDown} title="No weak topics detected yet" description="Take a few quizzes to build your personalized revision plan." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {weakTopics.map((w) => (
                <li key={w.topic} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-slate-900">{w.topic}</div>
                    <div className="text-xs text-slate-500">{w.reason}</div>
                  </div>
                  <Pill tone="indigo">{w.subject}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
