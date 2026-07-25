import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { topicVolume } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/analytics")({
  component: ClassAnalytics,
});

function ClassAnalytics() {
  const { subjects, documents, riskProfiles } = useAppData();

  const riskBadge: Record<string, string> = {
    Low: "bg-green-100 text-green-700 font-bold",
    Medium: "bg-amber-100 text-amber-700 font-bold",
    High: "bg-red-100 text-red-700 font-bold",
  };

  return (
    <div>
      <PageHeader
        title="Class Engagement & ML Student Risk Analytics"
        subtitle="ML prediction model tracking performance trends and identifying at-risk students for proactive faculty support."
      />

      {/* Phase 8: At-Risk Students ML Prediction Table */}
      <Card className="mb-6" title="ML Student Performance Trend & Falling Behind Risk">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Student Name</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Average Quiz Score</th>
                <th className="pb-3 pr-4">Performance Trend</th>
                <th className="pb-3 pr-4">Risk of Falling Behind</th>
                <th className="pb-3">Weak Concepts</th>
              </tr>
            </thead>
            <tbody>
              {riskProfiles.map((p) => (
                <tr key={p.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-bold text-slate-900">{p.studentName}</td>
                  <td className="py-3 pr-4 text-slate-600">{p.subject}</td>
                  <td className="py-3 pr-4 font-semibold text-indigo-brand">{p.scorePct}%</td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", p.trend === "Improving" ? "bg-green-50 text-green-700" : p.trend === "Stable" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-700")}>
                      {p.trend === "Improving" ? "↗ Improving" : p.trend === "Stable" ? "→ Stable" : "↘ Declining"}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn("rounded-full px-3 py-1 text-xs capitalize shadow-2xs", riskBadge[p.risk])}>
                      {p.risk} Risk Warning
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{p.weakTopicCount} Topics</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Student Weakest Concepts (Revision Needed)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicVolume.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
                <XAxis type="number" fontSize={12} stroke="#64748B" />
                <YAxis dataKey="topic" type="category" width={100} fontSize={12} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="asked" fill="#D97706" radius={[0, 6, 6, 0]} name="Questions Asked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Approved Materials Coverage">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects.map(s => ({ subject: s.code, count: documents.filter(d => d.subjectId === s.id && d.status === "approved").length }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
                <XAxis dataKey="subject" fontSize={12} stroke="#64748B" />
                <YAxis fontSize={12} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Approved Docs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
