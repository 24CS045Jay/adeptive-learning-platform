import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw, Trash2 } from "lucide-react";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { documents, subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/knowledge")({
  component: KnowledgeBase,
});

function KnowledgeBase() {
  const indexed = documents.filter((d) => d.status === "approved");
  const chunks = indexed.reduce((s, d) => s + d.chunks, 0);
  return (
    <div>
      <PageHeader
        title="Knowledge Base"
        subtitle={`${indexed.length} documents · ${chunks} indexed chunks`}
        action={
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option>All subjects</option>
            {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3">Document</th><th className="pb-3">Subject</th><th className="pb-3">Status</th><th className="pb-3">Chunks</th><th className="pb-3">Priority</th><th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => {
              const subj = subjects.find((s) => s.id === d.subjectId);
              return (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="py-3 text-slate-600">{subj?.name}</td>
                  <td className="py-3"><Pill tone={statusTone(d.status)}>{d.status}</Pill></td>
                  <td className="py-3 text-slate-600">{d.chunks || "—"}</td>
                  <td className="py-3 text-slate-600">{d.priority}</td>
                  <td className="py-3">
                    <div className="flex gap-2 text-slate-400">
                      <button className="hover:text-indigo-brand"><RefreshCcw className="h-4 w-4" /></button>
                      <button className="hover:text-red-brand"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
