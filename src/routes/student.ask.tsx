import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useId, useRef } from "react";
import {
  Send, Sparkles, Sliders,
  FileText, History, Plus, Trash2,
  BookOpen, ThumbsUp, ThumbsDown, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import { useAuth } from "@/lib/auth";
import {
  runAdaptiveRagPipeline,
  type RagMode,
  type RagResponse,
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

/* ── Upgraded Typing Indicator ── */
function TypingIndicator() {
  const dotColors = ["bg-violet", "bg-gold", "bg-success"];
  return (
    <div className="flex max-w-xs items-center gap-3 rounded-2xl border border-violet/20 bg-card px-4 py-3.5 shadow-sm chat-ai-bubble">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet/15 ring-1 ring-violet/20">
        <Sparkles className="h-3.5 w-3.5 text-violet" />
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("typing-dot h-2.5 w-2.5 rounded-full", dotColors[i])}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground italic">Thinking…</span>
    </div>
  );
}

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

  const [selectedCitation, setSelectedCitation] = useState<{
    docName: string;
    page: number;
    unit: string;
    chunkContent: string;
    similarity: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ai_tutor_chat_sessions", JSON.stringify(sessions));
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    await new Promise((r) => setTimeout(r, 600));

    const ragResult = await runAdaptiveRagPipeline(q, subjectName, ragMode, relevanceThreshold, documents);

    const aiMsg: ChatMessage = {
      id: `msg_ai_${Date.now()}`,
      role: "ai",
      text: ragResult.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ragResult,
    };

    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, aiMsg] } : s)));
    setIsProcessing(false);
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
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              showControls
                ? "border-violet bg-violet/5 text-violet shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)]"
                : "border-border bg-card text-muted-foreground hover:border-violet/40"
            )}
          >
            <Sliders className="h-4 w-4" />
            RAG Controls &amp; Threshold
          </button>
        }
      />

      {showControls && (
        <div className="mb-6 rounded-2xl border border-violet/20 bg-violet/5 p-5 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Context</label>
              <select value={subjectName} onChange={(e) => setSubjectName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet transition">
                {subjects.map((s) => (<option key={s.id} value={s.name}>{s.name} ({s.code})</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Retrieval Strategy Mode</label>
              <select value={ragMode} onChange={(e) => setRagMode(e.target.value as RagMode)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-violet transition">
                <option value="Adaptive RAG (Auto)">Adaptive RAG (Auto Query Intent Routing)</option>
                <option value="Dense Vector">Dense Vector Search (Cosine Similarity)</option>
                <option value="Hybrid (BM25+Dense)">Hybrid Search (BM25 + Cosine)</option>
                <option value="Direct LLM">Direct LLM (No Document Context)</option>
              </select>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Relevance Cutoff Threshold</span>
                <span className="text-violet font-bold">{Math.round(relevanceThreshold * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="0.9" step="0.05" value={relevanceThreshold}
                onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))}
                className="w-full accent-violet cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sessions sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Conversations
              <span className="ml-1 rounded-full bg-violet/10 px-1.5 py-0.5 text-violet font-bold">{sessions.length}</span>
            </span>
            <button type="button" onClick={createNewSession}
              className="flex items-center gap-1 rounded-lg bg-violet/10 px-2.5 py-1 text-xs font-semibold text-violet hover:bg-violet/20 transition">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {sessions.map((s) => {
              const active = s.id === activeSessionId;
              return (
                <motion.div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  whileHover={{ x: 2 }}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition text-xs",
                    active
                      ? "bg-violet text-white font-medium shadow-[0_0_14px_-4px_oklch(0.62_0.22_293_/_50%)]"
                      : "bg-card text-foreground hover:bg-accent border border-border"
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate font-semibold">{s.title || "Untitled chat"}</div>
                    <div className={cn("text-[11px] truncate mt-0.5", active ? "text-violet-200 opacity-80" : "text-muted-foreground")}>
                      {s.subject} · {s.messages.length} msgs
                    </div>
                  </div>
                  <button type="button" onClick={(e) => deleteSession(s.id, e)}
                    className={cn("opacity-0 group-hover:opacity-100 transition p-1 rounded", active ? "hover:bg-white/20 text-white" : "hover:text-danger text-muted-foreground")}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex flex-col min-h-[520px]">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/10 text-violet">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{subjectName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground font-medium">Mode: {ragMode}</span>
                  <span className="rounded-full bg-violet/10 px-2.5 py-1 text-violet font-semibold">Cutoff: {Math.round(relevanceThreshold * 100)}%</span>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto pr-1 pb-4">
                {activeSession.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet/10 text-violet shadow-[0_0_24px_-4px_oklch(0.62_0.22_293_/_35%)]"
                    >
                      <Sparkles className="h-8 w-8" />
                    </motion.div>
                    <div className="font-serif text-2xl font-bold text-foreground">Ask the Adaptive AI Tutor</div>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Answers are generated from your faculty's approved course materials with automatic query routing, chunk re-ranking, and hallucination guardrails.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {activeSession.messages.map((msg, idx) => {
                      const prevMsg = activeSession.messages[idx - 1];
                      return (
                        <ChatMessageBubble
                          key={msg.id}
                          msg={msg}
                          userQuestion={prevMsg?.role === "user" ? prevMsg.text : msg.text}
                          onFeedbackSubmit={(q, a, isUp, comment) => addAiFeedback(q, a, isUp, comment)}
                        />
                      );
                    })}
                  </AnimatePresence>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="flex justify-start"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 shadow-sm focus-within:border-violet/50 focus-within:shadow-[0_0_0_3px_oklch(0.62_0.22_293_/_12%)] transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask a question about ${subjectName}…`}
                  disabled={isProcessing}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <motion.button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isProcessing}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ boxShadow: "0 0 18px -3px oklch(0.62 0.22 293 / 55%)" }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#9d72f7] to-[#7c3aed] text-white disabled:opacity-40 transition-all"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ChatMessageBubble({
  msg,
  userQuestion,
  onFeedbackSubmit,
}: {
  msg: ChatMessage;
  userQuestion: string;
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
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex justify-end"
      >
        <div className="max-w-xl rounded-2xl rounded-tr-sm chat-user-bubble px-4 py-3 text-sm text-white shadow-sm"
          style={{ boxShadow: "0 4px 16px -4px oklch(0.62 0.22 293 / 40%)" }}>
          <div className="leading-relaxed">{msg.text}</div>
          <div className="mt-1 text-[10px] text-violet-200 text-right opacity-75">{msg.timestamp}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex gap-3 max-w-3xl"
    >
      {/* AI Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet/15 ring-1 ring-violet/25 shadow-[0_0_10px_-2px_oklch(0.62_0.22_293_/_30%)] mt-1">
        <Sparkles className="h-4 w-4 text-violet" />
      </div>

      <div className="flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-violet/15 bg-card p-5 shadow-sm space-y-4 chat-ai-bubble"
          style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.15)" }}>
          {rag && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-violet/10 px-2.5 py-0.5 font-bold capitalize text-violet">Intent: {rag.intent}</span>
                <span className="rounded-md bg-muted px-2.5 py-0.5 text-muted-foreground font-medium">{rag.strategy}</span>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px]", rag.confidenceScore >= 80 ? "bg-success/10 text-success font-bold" : "bg-gold/10 text-gold font-bold")}>
                Grounded: {rag.confidenceScore}%
              </span>
            </div>
          )}

          <div className="text-sm leading-relaxed text-foreground whitespace-pre-line font-sans">{msg.text}</div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Was this helpful?</span>
              <button
                type="button"
                onClick={() => handleRate("up")}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2.5 py-1 transition",
                  rated === "up" ? "border-success bg-success/10 text-success font-bold" : "border-border bg-card text-muted-foreground hover:border-success hover:text-success"
                )}
              >
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful
              </button>
              <button
                type="button"
                onClick={() => handleRate("down")}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2.5 py-1 transition",
                  rated === "down" ? "border-danger bg-danger/10 text-danger font-bold" : "border-border bg-card text-muted-foreground hover:border-danger hover:text-danger"
                )}
              >
                <ThumbsDown className="h-3.5 w-3.5" /> Needs Work
              </button>
            </div>
            {rated && (
              <span className="text-[11px] text-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Rating recorded
              </span>
            )}
          </div>

          {showCommentBox && (
            <form onSubmit={handleCommentSubmit} className="rounded-xl border border-danger/30 bg-danger/5 p-3 space-y-2 text-xs">
              <div className="font-semibold text-foreground">What could be improved?</div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. Missing code example, outdated formula…"
                rows={2}
                className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-violet transition"
              />
              <div className="flex justify-end gap-2">
                <button type="submit" className="rounded-lg bg-gradient-to-r from-violet to-[#7c3aed] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                  Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="mt-1 pl-2 text-[10px] text-muted-foreground">{msg.timestamp}</div>
      </div>
    </motion.div>
  );
}
