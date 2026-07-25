import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, CheckCircle2, ShieldCheck, Printer, Filter, Sparkles } from "lucide-react";
import { PageHeader, Card, PrimaryButton, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
});

export type ReportType = "student_mastery" | "faculty_coverage" | "rag_compliance";

function Reports() {
  const { subjects, documents, users, queries } = useAppData();

  const [activeReportType, setActiveReportType] = useState<ReportType>("student_mastery");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess]     = useState(false);

  const reportRows = subjects.map((s, i) => {
    const approvedDocs = documents.filter((d) => d.subjectId === s.id && d.status === "approved").length;
    const studentCount = s.enrolledStudentIds.length;
    const masteryPct = [84, 91, 76, 78, 88, 72][i] ?? 80;

    return {
      subjectName: s.name,
      code: s.code,
      faculty: s.faculty,
      approvedDocs,
      studentCount,
      queriesCount: Math.round(approvedDocs * 24 + 30),
      masteryPct,
      complianceStatus: "Compliant ✓",
    };
  });

  const handleExportCSV = () => {
    const headers = ["Subject,Code,Faculty,Approved_Docs,Enrolled_Students,Total_Queries,Mastery_Pct,Compliance"];
    reportRows.forEach((r) => {
      headers.push(`"${r.subjectName}","${r.code}","${r.faculty}",${r.approvedDocs},${r.studentCount},${r.queriesCount},"${r.masteryPct}%","${r.complianceStatus}"`);
    });

    const blob = new Blob([headers.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `institutional_report_${activeReportType}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Institutional Export & Reports Workbench"
        subtitle="Generate, preview, and export compliance reports for accreditation, faculty reviews, and student mastery audits."
        action={
          <div className="flex items-center gap-2">
            <PrimaryButton icon={Download} onClick={handleExportCSV}>
              Export Report (CSV)
            </PrimaryButton>
          </div>
        }
      />

      {downloadSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700 font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Institutional report exported successfully! File saved to your downloads.
        </div>
      )}

      {/* Report Type Selector Tabs */}
      <div className="mb-6 flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-xs">
        {[
          { id: "student_mastery", label: "Student Performance & Mastery Report" },
          { id: "faculty_coverage", label: "Faculty Document Coverage & Approvals" },
          { id: "rag_compliance", label: "RAG Engine Groundedness Compliance Audit" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveReportType(tab.id as ReportType)}
            className={cn(
              "border-b-2 px-5 py-4 text-sm font-medium transition",
              activeReportType === tab.id
                ? "border-indigo-brand text-indigo-brand font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Generated Summary Table · {new Date().toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="green">Accreditation Compliant ✓</Pill>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Faculty Lead</th>
                <th className="pb-3 pr-4">Approved Materials</th>
                <th className="pb-3 pr-4">Enrolled Students</th>
                <th className="pb-3 pr-4">Total RAG Queries</th>
                <th className="pb-3 pr-4">Avg Student Mastery</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((r) => (
                <tr key={r.code} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-bold text-slate-900">{r.subjectName}</td>
                  <td className="py-3 pr-4 text-slate-600 font-mono text-xs">{r.code}</td>
                  <td className="py-3 pr-4 text-slate-700">{r.faculty}</td>
                  <td className="py-3 pr-4 text-slate-700 font-semibold">{r.approvedDocs} Docs</td>
                  <td className="py-3 pr-4 text-slate-600">{r.studentCount} Students</td>
                  <td className="py-3 pr-4 text-indigo-brand font-semibold">{r.queriesCount}</td>
                  <td className="py-3 pr-4 text-green-700 font-bold">{r.masteryPct}%</td>
                  <td className="py-3"><Pill tone="green">{r.complianceStatus}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
