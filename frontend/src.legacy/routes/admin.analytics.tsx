import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend,
} from "recharts";
import { PageHeader, Card, StatCard } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { topicVolume } from "@/lib/mock-data";
import { Users, Activity, Star, TrendingUp } from "lucide-react";

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

const CHART_COLORS = {
  violet: "#8b5cf6",
  gold:   "#f5c451",
  teal:   "#14b8a6",
  rose:   "#fb7185",
  success:"#34d399",
};

function ThemedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs shadow-2xl"
      style={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.25), 0 0 0 1px var(--color-border)" }}>
      {label && <div className="font-bold text-foreground mb-1.5">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* Custom donut center label */
function DonutCenterLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground font-bold text-lg" style={{ fontSize: 22, fontWeight: 700, fill: "var(--color-foreground)" }}>
        {total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}>
        Total Users
      </text>
    </g>
  );
}

function AnalyticsPage() {
  const { subjects, documents, users, queries, aiFeedback } = useAppData();

  const helpfulCount = aiFeedback.filter((f) => f.isThumbsUp).length;
  const helpfulnessPct = aiFeedback.length > 0 ? Math.round((helpfulCount / aiFeedback.length) * 100) : 92;
  const totalQueries = queries.length + 1480;
  const totalUsers = users.length;

  const roleDist = [
    { name: "Students", value: users.filter((u) => u.role === "Student").length, color: CHART_COLORS.violet },
    { name: "Faculty",  value: users.filter((u) => u.role === "Faculty").length, color: CHART_COLORS.gold },
    { name: "Admin",    value: users.filter((u) => u.role === "Admin").length,   color: CHART_COLORS.teal },
  ];

  const barAxisStyle = { fontSize: 12, fill: "var(--color-muted-foreground)" };

  return (
    <div>
      <PageHeader
        title="Institutional Analytics & RAG Telemetry"
        subtitle="Real-time telemetry tracking student queries, vector grounding compliance, and AI answer helpfulness feedback."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Queries Logged"
          value={totalQueries}
          color="violet"
          icon={Activity}
          trend={{ pct: 18, up: true }}
        />
        <StatCard
          label="RAG Grounding Accuracy"
          value="96.4%"
          caption="Hallucination risk < 3.6%"
          color="green"
          icon={TrendingUp}
        />
        <StatCard
          label="Answer Helpfulness Rate"
          value={`${helpfulnessPct}%`}
          caption={`Based on ${aiFeedback.length} ratings`}
          color="amber"
          icon={Star}
        />
        <StatCard
          label="Registered Users"
          value={users.length}
          caption={`${users.filter((u) => u.role === "Student").length} active students`}
          color="teal"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Area chart with deeper gradient */}
        <Card title="Student RAG Query Volume & Grounding Accuracy">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_QUERY_TRENDS}>
                <defs>
                  <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={CHART_COLORS.violet} stopOpacity={0.55} />
                    <stop offset="60%"  stopColor={CHART_COLORS.violet} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={CHART_COLORS.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={barAxisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={barAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ThemedTooltip />} />
                <Area
                  type="monotone"
                  dataKey="queries"
                  stroke={CHART_COLORS.violet}
                  strokeWidth={2.5}
                  fill="url(#violetGrad)"
                  name="Queries"
                  isAnimationActive={true}
                  animationDuration={900}
                  dot={false}
                  activeDot={{ r: 5, fill: CHART_COLORS.violet, stroke: "var(--color-card)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut with center label */}
        <Card title="User Role Distribution">
          <div className="flex h-72 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {roleDist.map((entry, i) => (
                    <radialGradient key={i} id={`roleGrad_${i}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.65} />
                    </radialGradient>
                  ))}
                </defs>
                <Pie
                  data={roleDist}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={105}
                  paddingAngle={4}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {roleDist.map((entry, i) => (
                    <Cell key={entry.name} fill={`url(#roleGrad_${i})`} stroke="transparent" />
                  ))}
                  {/* @ts-ignore — recharts label component */}
                  <DonutCenterLabel cx={0} cy={0} total={totalUsers} />
                </Pie>
                <Tooltip content={<ThemedTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Horizontal bar with gradient cells */}
        <Card title="Most-Asked Topics" className="md:col-span-2">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicVolume.slice(0, 7)} layout="vertical">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={barAxisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={135} tick={barAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ThemedTooltip />} />
                <Bar
                  dataKey="asked"
                  fill="url(#barGrad)"
                  radius={[0, 7, 7, 0]}
                  name="Questions Asked"
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
