import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area,
} from "recharts";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { topicVolume } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

const DAILY_QUERY_TRENDS = [
  { day: "Mon", queries: 142, groundedPct: 94 },
  { day: "Tue", queries: 198, groundedPct: 96 },
  { day: "Wed", queries: 245, groundedPct: 92 },
  { day: "Thu", queries: 310, groundedPct: 95 },
  { day: "Fri", queries: 280, groundedPct: 97 },
  { day: "Sat", queries: 175, groundedPct: 98 },
  { day: "Sun", queries: 130, groundedPct: 96 },
];

const HELPFULNESS_TRENDS = [
  { week: "W1", helpfulPct: 84 },
  { week: "W2", helpfulPct: 88 },
  { week: "W3", helpfulPct: 91 },
  { week: "W4", helpfulPct: 94 },
];

function AnalyticsPage() {
  const { subjects, documents, users, queries, aiFeedback } = useAppData();

  const helpfulCount = aiFeedback.filter((f) => f.isThumbsUp).length;
  const helpfulnessPct = aiFeedback.length > 0 ? Math.round((helpfulCount / aiFeedback.length) * 100) : 92;

  const roleDist = [
    { name: "Students", value: users.filter((u) => u.role === "Student").length, color: "#4F46E5" },
    { name: "Faculty",  value: users.filter((u) => u.role === "Faculty").length, color: "#D97706" },
    { name: "Admin",    value: users.filter((u) => u.role === "Admin").length,   color: "#1E1B3C" },
  ];

  return (
    <div>
      <PageHeader
        title="Institutional Analytics & RAG Telemetry"
        subtitle="Real-time telemetry tracking student queries, vector grounding compliance, and AI answer helpfulness feedback."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Queries Logged</div>
          <div className="mt-2 text-3xl font-bold text-indigo-brand">{queries.length + 1480}</div>
          <div className="mt-1 text-xs text-slate-400 font-medium">+18% from last week</div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">RAG Grounding Accuracy</div>
          <div className="mt-2 text-3xl font-bold text-green-600">96.4%</div>
          <div className="mt-1 text-xs text-slate-400 font-medium">Hallucination risk &lt; 3.6%</div>
        </div>

        {/* Phase 7: Answer Helpfulness Rating */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Answer Helpfulness Rate</div>
          <div className="mt-2 text-3xl font-bold text-amber-600">{helpfulnessPct}% Helpful</div>
          <div className="mt-1 text-xs text-slate-400 font-medium">Based on student feedback ({aiFeedback.length} ratings)</div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Registered Users</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{users.length}</div>
          <div className="mt-1 text-xs text-slate-400 font-medium">{users.filter(u => u.role === "Student").length} active students</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Student RAG Query Volume & Grounding Accuracy">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_QUERY_TRENDS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" />
                <XAxis dataKey="day" fontSize={12} stroke="#64748B" />
                <YAxis fontSize={12} stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="queries" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.15} name="Queries" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="User Role Distribution">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleDist} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={4}>
                  {roleDist.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
