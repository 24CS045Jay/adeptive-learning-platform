import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { documents, subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const pending = documents.filter((d) => d.status === "pending");
  return (
    <div>
      <PageHeader title="Content Approval" subtitle="Faculty-submitted documents awaiting review." />
      <Card>
        <ul className="divide-y divide-slate-100">
          {pending.map((d) => {
            const subj = subjects.find((s) => s.id === d.subjectId);
            return (
              <li key={d.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium text-slate-900">{d.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Pill tone="indigo">{subj?.name}</Pill>
                    <span>Submitted by {d.uploadedBy}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md bg-green-brand px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"><Check className="h-3.5 w-3.5" /> Approve</button>
                  <button className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-brand ring-1 ring-red-brand/30 hover:bg-red-brand/5"><X className="h-3.5 w-3.5" /> Reject</button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
