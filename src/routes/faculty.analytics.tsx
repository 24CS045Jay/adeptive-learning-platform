import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageHeader, Card } from "@/components/app-shell";
import { subjectActivity, topicVolume } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/analytics")({
  component: ClassAnalytics,
});

function ClassAnalytics() {
  const my = subjectActivity.slice(0, 3).map((s) => ({ subject: s.subject.split(" ")[0], queries: s.queries }));
  return (
    <div>
      <PageHeader title="Class Analytics" subtitle="Engagement across your subjects." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Query Volume by Subject">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={my}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis dataKey="subject" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="queries" fill="#5b4bd6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Weakest Topics">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topicVolume.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="topic" type="category" width={100} fontSize={12} />
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
