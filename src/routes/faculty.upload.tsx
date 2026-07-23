import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { PageHeader, Card, PrimaryButton } from "@/components/app-shell";
import { subjects } from "@/lib/mock-data";

export const Route = createFileRoute("/faculty/upload")({
  component: UploadContent,
});

function UploadContent() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div>
      <PageHeader title="Upload Content" subtitle="Add course material for admin review before it's indexed into the tutor." />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="grid gap-4 md:max-w-xl">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Document</label>
            <div className="mt-2 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <div>
                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                <div className="mt-2 text-sm font-medium text-slate-700">Drop PDF, PPTX, or DOCX here</div>
                <div className="text-xs text-slate-500">or click to browse</div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</label>
            <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit tag</label>
            <input placeholder="e.g. Unit 3 — Spark" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div><PrimaryButton type="submit" icon={Upload}>Submit for review</PrimaryButton></div>
          {submitted && <div className="text-sm text-green-brand">Uploaded — waiting for admin approval.</div>}
        </form>
      </Card>
    </div>
  );
}
