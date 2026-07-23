import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { PageHeader, Card } from "@/components/app-shell";
import { subjectActivity, topicVolume, users } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const bar = subjectActivity.map((s) => ({ subject: s.subject.split(" ")[0], queries: s.queries }));
  const roleDist = ["Student", "Faculty", "Admin"].map((r) => ({ name: r, value: users.filter((u) => u.role === r).length }));
  const colors = ["#5b4bd6", "#f0b429", "#1e1b3c"];
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Engagement and content trends across the institution." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Query Volume by Subject">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={bar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="queries" fill="#5b4bd6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="User Distribution">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={roleDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {roleDist.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="mt-4">
        <Card title="Most-Asked Topics (Institution-wide)">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={topicVolume} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="topic" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="asked" fill="#5b4bd6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
