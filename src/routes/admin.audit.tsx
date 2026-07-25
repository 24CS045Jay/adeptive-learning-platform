import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Filter, ScrollText, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { auditLogs as defaultLogs } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/audit")({
  component: AuditLogsPage,
});

function actionTone(a: string) {
  if (a.includes("APPROVE") || a.includes("SUCCESS")) return "green" as const;
  if (a.includes("UPLOAD") || a.includes("REGISTER") || a.includes("ADD")) return "indigo" as const;
  if (a.includes("REJECT") || a.includes("DELETE")) return "red" as const;
  if (a.includes("REINDEX") || a.includes("UPDATE")) return "amber" as const;
  return "slate" as const;
}

function AuditLogsPage() {
  const [logs]                     = useState(defaultLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [exportedBanner, setExportedBanner] = useState(false);

  const filtered = logs.filter((l) => {
    if (roleFilter !== "all") {
      if (roleFilter === "admin" && !l.actor.includes("admin")) return false;
      if (roleFilter === "faculty" && !l.actor.includes("faculty") && !l.actor.includes("anil") && !l.actor.includes("priya")) return false;
      if (roleFilter === "student" && !l.actor.includes("student") && !l.actor.includes("meera") && !l.actor.includes("kabir")) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return l.actor.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const csvRows = ["ID,Time,Actor,Action,Details"];
    filtered.forEach((l) => {
      csvRows.push(`"${l.id}","${l.time}","${l.actor}","${l.action}","${l.details.replace(/"/g, '""')}"`);
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    setExportedBanner(true);
    setTimeout(() => setExportedBanner(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Immutable Compliance Audit Trail"
        subtitle={`System audit log tracking all platform actions, logins, approvals, and data modifications (${filtered.length} entries).`}
        action={
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-indigo-brand px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-brand-hover shadow-sm transition"
          >
            <Download className="h-4 w-4" /> Export Audit Log (CSV)
          </button>
        }
      />

      {exportedBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700 font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Audit log CSV exported successfully!
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor email, action code, or JSON payload..."
            className="w-full text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Actor Role:</span>
          {["all", "admin", "faculty", "student"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold capitalize transition",
                roleFilter === r
                  ? "bg-indigo-brand text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Actor Email</th>
                <th className="pb-3 pr-4">Action Event</th>
                <th className="pb-3">Audit Details (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 text-xs font-mono text-slate-500 whitespace-nowrap">{l.time}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-800 whitespace-nowrap">{l.actor}</td>
                  <td className="py-3 pr-4">
                    <Pill tone={actionTone(l.action)}>{l.action}</Pill>
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-600 truncate max-w-xs">{l.details}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                    No audit logs match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
