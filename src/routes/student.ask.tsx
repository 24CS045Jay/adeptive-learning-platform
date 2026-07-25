import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useId } from "react";
import {
  Send, Sparkles, Sliders, AlertTriangle, CheckCircle2, XCircle,
  FileText, ArrowRight, CornerDownRight, History, Plus, Trash2,
  ChevronDown, ChevronUp, BookOpen, Layers, ShieldCheck, HelpCircle,
  ThumbsUp, ThumbsDown, MessageSquare,
} from "lucide-react";
import { PageHeader, Card, Pill } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import {
  runAdaptiveRagPipeline,
  type RagMode,
  type RagResponse,
  type RetrievedChunk,
  type QueryIntent,
} from "@/lib/rag-engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/ask")({
  component: AskTutorPage,
});

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
  ragResult?: RagResponse;
}

interface ChatSession {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  messages: ChatMessage[];
}

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "sess_1",
    title: "MapReduce Shuffle & Sort",
    subject: "Big Data Analytics",
    createdAt: "Today, 10:15 AM",
    messages: [
      {
        id: "msg_1",
        role: "user",
        text: "How does MapReduce handle stragglers and shuffle data?",
        timestamp: "10:15 AM",
      },
    ],
  },
];

function AskTutorPage() {
  const { subjects, documents, addQuery, addAiFeedback } = useAppData();
  const { user } = useAuth();
  const id = useId();

  const [subjectName, setSubjectName] = useState<string>(subjects[0]?.name ?? "Big Data Analytics");
  const [ragMode, setRagMode]         = useState<RagMode>("Adaptive RAG (Auto)");
  const [relevanceThreshold, setRelevanceThreshold] = useState<number>(0.35);
  const [showControls, setShowControls] = useState<boolean>(false);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SESSIONS;
    try {
      const saved = localStorage.getItem("ai_tutor_chat_sessions");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id ?? "sess_1");
  const [input, setInput]                     = useState("");
  const [isProcessing, setIsProcessing]       = useState(false);
  const [activeStep, setActiveStep]           = useState<number>(0);

  const [selectedCitation, setSelectedCitation] = useState<{
    docName: string;
    page: number;
    unit: string;
    chunkContent: string;
    similarity: number;
  } | null>(null);

  const [escalatedState, setEscalatedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ai_tutor_chat_sessions", JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const createNewSession = () => {
    const newSess: ChatSession = {
      id: `sess_${Date.now()}`,
      title: "New Conversation",
      subject: subjectName,
      createdAt: "Just now",
      messages: [],
    };
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
  };

  const deleteSession = (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessId);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: `sess_${Date.now()}`,
          title: "New Conversation",
          subject: subjectName,
          createdAt: "Just now",
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessId) setActiveSessionId(remaining[0].id);
      return remaining;
    });
  };

  const handleSend = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? input).trim();
    if (!q || isProcessing) return;

    if (!overrideQuery) setInput("");

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      text: q,
      timestamp: timeStr,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const newTitle = s.messages.length === 0 ? q.slice(0, 30) + (q.length > 30 ? "…" : "") : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, userMsg] };
      })
    );

    addQuery({ student: user?.name ?? "Aarav Patel", subject: subjectName, question: q, createdAt: "Just now" });

    setIsProcessing(true);
    setActiveStep(1);
    await new Promise((r) => setTimeout(r, 250));
    setActiveStep(2);
    await new Promise((r) => setTimeout(r, 300));
    setActiveStep(3);

    const ragResult = await runAdaptiveRagPipeline(q, subjectName, ragMode, relevanceThreshold, documents);

    setActiveStep(4);
    await new Promise((r) => setTimeout(r, 250));

    const aiMsg: ChatMessage = {
      id: `msg_ai_${Date.now()}`,
      role: "ai",
      text: ragResult.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ragResult,
    };

    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s)));
    setIsProcessing(false);
    setActiveStep(0);
  };

  const handleEscalate = (msgId: string, question: string) => {
    setEscalatedState((prev) => ({ ...prev, [msgId]: true }));
  };

  return (
    <div>
      <PageHeader
        title="AI Tutor — Adaptive RAG Engine"
        subtitle="Multi-turn conversation with dynamic intent classification, hybrid retrieval, and citation verification."
        action={
          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              showControls ? "border-indigo-brand bg-indigo-brand/5 text-indigo-brand" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-brand/40"
            )}
          >
            <Sliders className="h-4 w-4" />
            RAG Controls & Threshold
          </button>
        }
      />

      {showControls && (
        <div className="mb-6 rounded-2xl border border-indigo-brand/20 bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Subject Context</label>
              <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand">
                {subjects.map((s) => (<option key={s.id} value={s.name}>{s.name} ({s.code})</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Retrieval Strategy Mode</label>
              <select value={ragMode} onChange={(e) => setRagMode(e.target.value as RagMode)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-brand font-medium">
                <option value="Adaptive RAG (Auto)">Adaptive RAG (Auto Query Intent Routing)</option>
                <option value="Dense Vector">Dense Vector Search (Cosine Similarity)</option>
                <option value="Hybrid (BM25+Dense)">Hybrid Search (BM25 + Cosine)</option>
                <option value="Direct LLM">Direct LLM (No Document Context)</option>
              </select>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Relevance Cutoff Threshold</span>
                <span className="text-indigo-brand font-bold">{Math.round(relevanceThreshold * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="0.9" step="0.05" value={relevanceThreshold} onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))} className="w-full accent-indigo-brand cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Conversations</span>
            <button type="button" onClick={createNewSession} className="flex items-center gap-1 rounded-lg bg-indigo-brand/10 px-2.5 py-1 text-xs font-semibold text-indigo-brand hover:bg-indigo-brand/20 transition"><Plus className="h-3.5 w-3.5" /> New</button>
          </div>
          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {sessions.map((s) => {
              const active = s.id === activeSessionId;
              return (
                <div key={s.id} onClick={() => setActiveSessionId(s.id)} className={cn("group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition text-xs", active ? "bg-indigo-brand text-white font-medium shadow-sm" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100")}>
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-semibold">{s.title || "Untitled chat"}</div>
                    <div className={cn("text-[11px] truncate mt-0.5", active ? "text-indigo-100" : "text-slate-400")}>{s.subject} · {s.messages.length} msgs</div>
                  </div>
                  <button type="button" onClick={(e) => deleteSession(s.id, e)} className={cn("opacity-0 group-hover:opacity-100 transition p-1 hover:text-red-400", active ? "text-white" : "text-slate-400")}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-brand/10 text-indigo-brand"><BookOpen className="h-4 w-4" /></div>
                  <span className="text-sm font-bold text-slate-800">{subjectName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 font-medium">Mode: {ragMode}</span>
                  <span className="rounded-full bg-indigo-brand/10 px-2.5 py-1 text-indigo-brand font-semibold">Cutoff: {Math.round(relevanceThreshold * 100)}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-1 pb-4">
                {activeSession.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-brand/10 text-indigo-brand"><Sparkles className="h-7 w-7" /></div>
                    <div className="font-serif text-2xl font-bold text-slate-900">Ask the Adaptive AI Tutor</div>
                    <p className="mt-2 max-w-md text-sm text-slate-500">Answers are generated from your faculty's approved course materials with automatic query routing, chunk re-ranking, and hallucination guardrails.</p>
                  </div>
                ) : (
                  activeSession.messages.map((msg, idx) => {
                    const prevMsg = activeSession.messages[idx - 1];
                    return (
                      <ChatMessageBubble
                        key={msg.id}
                        msg={msg}
                        userQuestion={prevMsg?.role === "user" ? prevMsg.text : msg.text}
                        onCitationClick={(cit) => setSelectedCitation(cit)}
                        onEscalate={(mId, qText) => handleEscalate(mId, qText)}
                        isEscalated={escalatedState[msg.id]}
                        onFollowUpClick={(text) => handleSend(text)}
                        onFeedbackSubmit={(q, a, isUp, comment) => addAiFeedback(q, a, isUp, comment)}
                      />
                    );
                  })
                )}

                {isProcessing && (
                  <div className="rounded-2xl border border-indigo-brand/20 bg-indigo-brand/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-brand uppercase tracking-wider"><Sparkles className="h-4 w-4 animate-spin" /> Adaptive RAG Pipeline Executing…</div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-4 pr-1.5 py-1.5 shadow-sm focus-within:border-indigo-brand">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={`Ask a question about ${subjectName}…`} disabled={isProcessing} className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => handleSend()} disabled={!input.trim() || isProcessing} className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-brand text-white hover:bg-indigo-brand-hover disabled:opacity-50 transition"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-brand" /><span className="font-serif text-lg font-bold text-slate-900">{selectedCitation.docName}</span></div>
              </div>
              <button type="button" onClick={() => setSelectedCitation(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed font-sans max-h-60 overflow-y-auto">"{selectedCitation.chunkContent}"</div>
            <div className="flex justify-end"><button type="button" onClick={() => setSelectedCitation(null)} className="rounded-xl bg-indigo-brand px-4 py-2 text-sm font-semibold text-white">Close Passage</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessageBubble({
  msg,
  userQuestion,
  onCitationClick,
  onEscalate,
  isEscalated,
  onFollowUpClick,
  onFeedbackSubmit,
}: {
  msg: ChatMessage;
  userQuestion: string;
  onCitationClick: (cit: any) => void;
  onEscalate: (msgId: string, text: string) => void;
  isEscalated?: boolean;
  onFollowUpClick: (text: string) => void;
  onFeedbackSubmit: (question: string, answer: string, isUp: boolean, comment?: string) => void;
}) {
  const [rated, setRated]             = useState<"up" | "down" | null>(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isUser = msg.role === "user";
  const rag = msg.ragResult;

  const handleRate = (type: "up" | "down") => {
    setRated(type);
    if (type === "down") {
      setShowCommentBox(true);
    } else {
      setShowCommentBox(false);
      onFeedbackSubmit(userQuestion, msg.text, true);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFeedbackSubmit(userQuestion, msg.text, false, commentText);
    setShowCommentBox(false);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xl rounded-2xl bg-indigo-brand px-4 py-3 text-sm text-white shadow-sm">
          <div>{msg.text}</div>
          <div className="mt-1 text-[10px] text-indigo-200 text-right">{msg.timestamp}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-3xl">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm space-y-4">
        {rag && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-brand/10 px-2.5 py-0.5 font-bold capitalize text-indigo-brand">Intent: {rag.intent}</span>
              <span className="rounded-md bg-slate-200 px-2.5 py-0.5 text-slate-700 font-medium">{rag.strategy}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px]", rag.confidenceScore >= 80 ? "bg-green-100 text-green-700 font-bold" : "bg-amber-100 text-amber-700 font-bold")}>
                Grounded: {rag.confidenceScore}%
              </span>
            </div>
          </div>
        )}

        <div className="text-sm leading-relaxed text-slate-800 space-y-2 whitespace-pre-line font-sans">{msg.text}</div>

        {/* Phase 7: Thumbs Up / Down Answer Helpfulness Feedback Controls */}
        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Was this answer helpful?</span>
            <button
              type="button"
              onClick={() => handleRate("up")}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1 transition",
                rated === "up" ? "border-green-500 bg-green-50 text-green-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-green-500"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Helpful
            </button>
            <button
              type="button"
              onClick={() => handleRate("down")}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1 transition",
                rated === "down" ? "border-red-400 bg-red-50 text-red-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-red-400"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Needs Work
            </button>
          </div>

          {rated && (
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Rating recorded
            </span>
          )}
        </div>

        {/* Thumbs-down feedback comment drawer */}
        {showCommentBox && (
          <form onSubmit={handleCommentSubmit} className="rounded-xl border border-red-200 bg-red-50/50 p-3 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">What could be improved in this answer?</div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="e.g. Missing code example, outdated formula, or ungrounded statement..."
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs outline-none focus:border-indigo-brand"
            />
            <div className="flex justify-end gap-2">
              <button type="submit" className="rounded-lg bg-indigo-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-brand-hover">Submit Feedback</button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
