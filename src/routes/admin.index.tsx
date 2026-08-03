import { createFileRoute } from "@tanstack/react-router";
import {
  Users, BookOpen, AlertCircle, FileCheck,
  MessageSquare, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader, StatCard, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")(
  { component: AdminDashboard }
);

const QUERY_SPARKLINE = [120, 145, 198, 178, 245, 310, 280];

function DocQueueRow({
  label,
  value,
  max,
  icon: Icon,
  color,
  pill,
}: {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
  color: string;
  pill: "amber" | "green" | "red";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className={cn("flex flex-col gap-2 rounded-xl border-l-[3px] p-3 transition hover:bg-accent/30",
      pill === "green" ? "border-l-success bg-success/5" :
      pill === "amber" ? "border-l-gold bg-gold/5" :
      "border-l-danger bg-danger/5"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Icon className={cn("h-4 w-4", pill === "green" ? "text-success" : pill === "amber" ? "text-gold" : "text-danger")} />
          {label}
        </div>
        <Pill tone={pill}>{value}</Pill>
      </div>
      <div className="progress-bar-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className={cn("progress-bar-fill",
            pill === "green" ? "bg-success" :
            pill === "amber" ? "bg-gold" :
            "bg-danger"
          )}
        />
      </div>
    </li>
  );
}

function MiniBarRow({ topic, value, max }: { topic: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="w-40 truncate text-sm text-foreground">{topic}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-violet to-violet/70"
        />
      </div>
      <Pill tone="indigo">{value}</Pill>
    </li>
  );
}

function AdminDashboard() {
  const { users, subjects, documents, escalations, topicVolume } = useAppData();

  const students = users.filter((u) => u.role === "Student").length;
  const faculty  = users.filter((u) => u.role === "Faculty").length;
  const admins   = users.filter((u) => u.role === "Admin").length;
  const openEsc  = escalations.filter((e) => e.status === "open").length;
  const pending  = documents.filter((d) => d.status === "pending").length;
  const approved = documents.filter((d) => d.status === "approved").length;
  const rejected = documents.filter((d) => d.status === "rejected").length;
  const totalDocs = pending + approved + rejected;

  const prevQueries = Math.round((topicVolume.reduce((a, t) => a + t.asked, 0) + 1480) * 0.82);
  const currentQueries = topicVolume.reduce((a, t) => a + t.asked, 0) + 1480;
  const queriesTrendPct = Math.round(((currentQueries - prevQueries) / Math.max(prevQueries, 1)) * 100);

  const prevEsc = Math.max(openEsc + 2, 1);
  const escTrendPct = Math.round(((openEsc - prevEsc) / prevEsc) * 100);

  const subjectActivity = subjects.map((s) => ({
    subject: s.name,
    code: s.code,
    approvedDocs: documents.filter((d) => d.subjectId === s.id && d.status === "approved").length,
  }));

  const topTopics = topicVolume.slice(0, 5);
  const topMax = topTopics[0]?.asked ?? 1;

  const subjectColors = ["bg-violet/15 text-violet", "bg-gold/15 text-gold", "bg-success/15 text-success", "bg-teal-brand/15 text-teal-brand", "bg-danger/15 text-danger"];

  return (
    <div>
      <PageHeader title="Institution Overview" subtitle="Platform-wide stats across all subjects and users." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Students"
          value={students}
          caption={`${faculty} faculty · ${admins} admin`}
          color="indigo"
          icon={Users}
        />
        <StatCard
          label="Total Queries Asked"
          value={currentQueries}
          color="violet"
          icon={MessageSquare}
          trend={{ pct: Math.abs(queriesTrendPct), up: queriesTrendPct >= 0 }}
          sparklineData={QUERY_SPARKLINE}
        />
        <StatCard label="Pending Approvals" value={pending} color="red" icon={FileCheck} />
        <StatCard
          label="Open Escalations"
          value={openEsc}
          color="teal"
          icon={AlertCircle}
          trend={{ pct: Math.abs(escTrendPct), up: escTrendPct >= 0 }}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Document Approval Queue">
          <ul className="space-y-2">
            <DocQueueRow
              label="Pending review"
              value={pending}
              max={totalDocs}
              icon={Clock}
              color="gold"
              pill="amber"
            />
            <DocQueueRow
              label="Approved & indexed"
              value={approved}
              max={totalDocs}
              icon={CheckCircle}
              color="success"
              pill="green"
            />
            <DocQueueRow
              label="Rejected"
              value={rejected}
              max={totalDocs}
              icon={XCircle}
              color="danger"
              pill="red"
            />
          </ul>
        </Card>

        <Card title="Most-Asked Topics">
          <ul>
            {topTopics.map((t) => (
              <MiniBarRow key={t.topic} topic={t.topic} value={t.asked} max={topMax} />
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Subject Activity — Approved Documents">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Approved Docs</th>
                  <th className="pb-3">Enrolled Students</th>
                </tr>
              </thead>
              <tbody>
                {subjectActivity.map((s, idx) => {
                  const subj = subjects.find((x) => x.name === s.subject);
                  const colorClass = subjectColors[idx % subjectColors.length];
                  const initials = s.code.slice(0, 3).toUpperCase();
                  return (
                    <motion.tr
                      key={s.subject}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className="border-t border-border transition hover:bg-accent/40"
                    >
                      <td className="py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold", colorClass)}>
                            {initials}
                          </span>
                          {s.subject}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{s.approvedDocs}</td>
                      <td className="py-3 text-muted-foreground">{subj?.enrolledStudentIds.length ?? 0}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
