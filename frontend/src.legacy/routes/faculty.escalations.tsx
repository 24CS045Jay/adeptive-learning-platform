import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Sparkles, Send, FileText, Check } from "lucide-react";
import { PageHeader, Card, Pill, statusTone } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty/escalations")({
  component: Escalations,
});

function Escalations() {
  const { escalations, resolveEscalation, subjects } = useAppData();
  const { user } = useAuth();

  const myEmail = user?.email?.toLowerCase() ?? "faculty@charusat.edu.in";
  const myName  = user?.name ?? "Dr. Nisha Shah";

  const [activeTab, setActiveTab] = useState<"open" | "resolved">("open");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [facultyResponse, setFacultyResponse] = useState<string>("");
  const [successBanner, setSuccessBanner] = useState<boolean>(false);

  const openList     = escalations.filter((e) => e.status === "open");
  const resolvedList = escalations.filter((e) => e.status === "resolved");

  const displayedList = activeTab === "open" ? openList : resolvedList;

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId || !facultyResponse.trim()) return;

    resolveEscalation(resolvingId, facultyResponse.trim(), myName);

    setResolvingId(null);
    setFacultyResponse("");
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 3500);
  };

  return (
    <div>
      <PageHeader
        title="Doubt Escalations Workspace"
        subtitle={`Cases where the AI Tutor had low grounding confidence. Resolving an escalation re-indexes your answer into the RAG vector store.`}
      />

      {successBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-success/5 px-6 py-4 text-sm text-success font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Escalation resolved! Answer officially verified and re-indexed into the AI Tutor vector store.
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex border-b border-border bg-card px-6 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("open")}
          className={cn(
            "border-b-2 px-5 py-4 text-sm font-medium transition",
            activeTab === "open"
              ? "border-amber-500 text-gold font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Open Escalations ({openList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resolved")}
          className={cn(
            "border-b-2 px-5 py-4 text-sm font-medium transition",
            activeTab === "resolved"
              ? "border-green-600 text-success font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Resolved & Vector Index Synced ({resolvedList.length})
        </button>
      </div>

      <div className="space-y-4">
        {displayedList.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 mb-2" />
              <div className="font-semibold text-foreground">
                {activeTab === "open" ? "No open escalations!" : "No resolved tickets."}
              </div>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {activeTab === "open" ? "All low-confidence student queries have been answered and indexed." : "Resolved tickets will appear here."}
              </p>
            </div>
          </Card>
        ) : (
          displayedList.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Pill tone="indigo">{e.subject}</Pill>
                    <span className="text-xs text-muted-foreground">Escalated by <strong className="text-foreground">{e.student}</strong> · {e.escalatedAt}</span>
                  </div>

                  <div className="font-serif text-lg font-bold text-foreground leading-snug">
                    "{e.question}"
                  </div>

                  {e.status === "resolved" && e.facultyAnswer && (
                    <div className="rounded-xl border border-green-200 bg-success/5/60 p-4 text-xs space-y-1.5 mt-3">
                      <div className="font-bold text-green-800 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-green-600" /> Verified Faculty Answer (Re-indexed in Vector Store):
                      </div>
                      <p className="text-foreground leading-relaxed font-sans">{e.facultyAnswer}</p>
                      <div className="text-[11px] text-muted-foreground">Resolved by {e.resolvedBy ?? myName}</div>
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {e.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => { setResolvingId(e.id); setFacultyResponse(""); }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> Resolve & Re-index
                    </button>
                  ) : (
                    <Pill tone="green">Vector Synced ✓</Pill>
                  )}
                </div>
              </div>

              {/* Faculty Resolution Modal / Drawer */}
              {resolvingId === e.id && (
                <form onSubmit={handleConfirmResolve} className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-violet" /> Provide Official Faculty Answer
                  </div>
                  <textarea
                    value={facultyResponse}
                    onChange={(e) => setFacultyResponse(e.target.value)}
                    placeholder="Write detailed explanation... Clicking resolve will automatically index this answer into the AI Tutor vector store for future students."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card p-3 text-xs outline-none focus:border-violet font-sans"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setResolvingId(null)}
                      className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-accent/40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-green-brand px-5 py-2 text-xs font-semibold text-white hover:opacity-90 transition shadow-sm"
                    >
                      <Check className="h-4 w-4" /> Ingest & Mark Resolved
                    </button>
                  </div>
                </form>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
