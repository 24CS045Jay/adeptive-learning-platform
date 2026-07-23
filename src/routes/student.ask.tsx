import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { subjects, chatSources } from "@/lib/mock-data";

export const Route = createFileRoute("/student/ask")({
  component: AskTutor,
});

type Msg = { role: "user" | "ai"; text: string };

function AskTutor() {
  const [subject, setSubject] = useState(subjects[0].name);
  const [unit, setUnit] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      { role: "ai", text: `Based on the approved course material for ${subject}${unit ? ` (${unit})` : ""}, here is a grounded explanation of "${q}". This is a mock response — the real answer will cite the exact passages retrieved from your faculty's uploaded documents.` },
    ]);
    setInput("");
  };

  return (
    <div>
      <PageHeader title="Ask Tutor" subtitle="Grounded answers with citations from your approved course material." />
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          {subjects.map((s) => <option key={s.id}>{s.name}</option>)}
        </select>
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit tag filter (optional)" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
      </div>
      <Card>
        <div className="min-h-[380px]">
          {msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-brand/10 text-indigo-brand">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="font-serif text-2xl font-bold text-slate-900">Ask anything from your syllabus</div>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Answers are grounded in your faculty's approved course material, with citations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  <div className={m.role === "user" ? "max-w-xl rounded-2xl bg-indigo-brand px-4 py-2.5 text-sm text-white" : "max-w-2xl rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800"}>
                    <div>{m.text}</div>
                    {m.role === "ai" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chatSources.map((s) => <Pill key={s.doc} tone="indigo">{s.doc} · {s.unit}</Pill>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-4 pr-1.5 py-1.5">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question about this subject..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          <button onClick={send} className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-brand text-white hover:bg-indigo-brand-hover">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
