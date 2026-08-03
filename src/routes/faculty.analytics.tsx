import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { topicVolume } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/analytics")({
  component: ClassAnalytics,
});

const CHART_COLORS = {
  violet:  "#8b5cf6",
  gold:    "#f5c451",
  success: "#34d399",
  danger:  "#fb7185",
};

const MASTERY_DATA = [
  { name: "Strong",  value: 34, color: CHART_COLORS.success, pct: "34%" },
  { name: "Average", value: 45, color: CHART_COLORS.gold,    pct: "45%" },
  { name: "Weak",    value: 21, color: CHART_COLORS.danger,  pct: "21%" },
];

const MASTERY_TOTAL = MASTERY_DATA.reduce((a, d) => a + d.value, 0);

function ThemedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs shadow-2xl"
      style={{ boxShadow: "0 8px 24px -6px rgba(0,0,0,0.25), 0 0 0 1px var(--color-border)" }}
    >
      {label && <div className="font-bold text-foreground mb-1.5">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted-foreground">{p.name ?? p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}{typeof p.value === "number" && p.name?.includes("%") ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
}

/* Custom donut center label for Class Mastery */
function MasteryCenterLabel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: "var(--color-foreground)" }}>
        {MASTERY_TOTAL}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}>
        Students
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" style={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}>
        in class
      </text>
    </g>
  );
}

function ClassAnalytics() {
  const { subjects, documents, riskProfiles } = useAppData();

  const barAxisStyle = { fontSize: 12, fill: "var(--color-muted-foreground)" };

  return (
    <div>
      <PageHeader
        title="Class Engagement & ML Student Risk Analytics"
        subtitle="ML prediction model tracking performance trends and identifying at-risk students for proactive faculty support."
      />

      <Card className="mb-6" title="ML Student Performance Trend & Falling Behind Risk">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pr-4">Student Name</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Avg Quiz Score</th>
                <th className="pb-3 pr-4">Performance Trend</th>
                <th className="pb-3 pr-4">Risk of Falling Behind</th>
                <th className="pb-3">Weak Concepts</th>
              </tr>
            </thead>
            <tbody>
              {riskProfiles.map((p, idx) => {
                const initials = p.studentName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <tr key={p.studentId} className={cn("border-t border-border transition hover:bg-accent/40", idx % 2 === 1 && "bg-muted/15")}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet/10 text-xs font-bold text-violet avatar-ring-violet">
                          {initials}
                        </div>
                        <span className="font-bold text-foreground">{p.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.subject}</td>
                    <td className="py-3 pr-4 font-semibold text-violet">{p.scorePct}%</td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        p.trend === "Improving"
                          ? "bg-success/10 text-success"
                          : p.trend === "Stable"
                          ? "bg-muted text-muted-foreground"
                          : "bg-danger/10 text-danger"
                      )}>
                        {p.trend === "Improving" ? "↗ Improving" : p.trend === "Stable" ? "→ Stable" : "↘ Declining"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={p.risk === "High" ? "danger" : p.risk === "Medium" ? "amber" : "success"}>
                        {p.risk} Risk
                      </Pill>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.weakTopicCount} Topics</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Horizontal bar with gradient */}
        <Card title="Student Weakest Concepts (Revision Needed)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicVolume.slice(0, 5)} layout="vertical">
                <defs>
                  <linearGradient id="goldBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f5c451" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={barAxisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={100} tick={barAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ThemedTooltip />} />
                <Bar
                  dataKey="asked"
                  fill="url(#goldBarGrad)"
                  radius={[0, 7, 7, 0]}
                  name="Questions Asked"
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut with center label + custom legend */}
        <Card title="Class Mastery Breakdown">
          <div className="h-64 flex items-center">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <defs>
                    {MASTERY_DATA.map((entry, i) => (
                      <radialGradient key={i} id={`masteryGrad_${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={MASTERY_DATA}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={98}
                    paddingAngle={4}
                    isAnimationActive
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {MASTERY_DATA.map((entry, i) => (
                      <Cell key={entry.name} fill={`url(#masteryGrad_${i})`} stroke="transparent" />
                    ))}
                    {/* @ts-ignore */}
                    <MasteryCenterLabel cx={0} cy={0} />
                  </Pie>
                  <Tooltip content={<ThemedTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom legend */}
            <div className="flex shrink-0 flex-col gap-2 pl-4">
              {MASTERY_DATA.map((d) => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm text-foreground font-medium">{d.name}</span>
                  <span className="text-xs font-bold" style={{ color: d.color }}>{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Vertical bar — approved docs */}
        <Card title="Approved Materials Coverage" className="md:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects.map(s => ({
                subject: s.code,
                count: documents.filter(d => d.subjectId === s.id && d.status === "approved").length
              }))}>
                <defs>
                  <linearGradient id="violetBarGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="subject" tick={barAxisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={barAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<ThemedTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#violetBarGrad2)"
                  radius={[7, 7, 0, 0]}
                  name="Approved Docs"
                  isAnimationActive
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
