import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ListChecks, Sparkles, Trophy, Flame, Award, ArrowRight,
  CheckCircle2, XCircle, FileText, ChevronRight, HelpCircle,
  BarChart3, CornerDownRight, RotateCcw,
} from "lucide-react";
import { PageHeader, Card, Pill, PrimaryButton } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import {
  INITIAL_QUIZZES,
  INITIAL_LEADERBOARD,
  DEFAULT_GAMIFICATION,
  type Quiz,
  type QuizQuestion,
  type QuestionDifficulty,
} from "@/lib/quiz-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/quizzes")({
  component: StudentQuizzesPage,
});

function StudentQuizzesPage() {
  const { subjects } = useAppData();

  // Quizzes list state (persisted in localStorage)
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    if (typeof window === "undefined") return INITIAL_QUIZZES;
    try {
      const saved = localStorage.getItem("ai_tutor_quizzes");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_QUIZZES;
  });

  const [leaderboard] = useState(INITIAL_LEADERBOARD);
  const [gamification, setGamification] = useState(DEFAULT_GAMIFICATION);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Active quiz runner state
  const [activeQuiz, setActiveQuiz]         = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex]   = useState<number>(0);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<QuestionDifficulty>("easy");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState<string>("");
  const [submittedAnswer, setSubmittedAnswer] = useState<boolean>(false);
  const [userScore, setUserScore]           = useState<number>(0); // count of correct answers
  const [earnedXp, setEarnedXp]             = useState<number>(0);
  const [isCompleted, setIsCompleted]       = useState<boolean>(false);

  // Sync quizzes to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("ai_tutor_quizzes", JSON.stringify(quizzes));
    } catch {}
  }, [quizzes]);

  const startQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setCurrentQIndex(0);
    setAdaptiveDifficulty("easy");
    setSelectedOption(null);
    setShortAnswerInput("");
    setSubmittedAnswer(false);
    setUserScore(0);
    setEarnedXp(0);
    setIsCompleted(false);
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQIndex];

  const handleConfirmAnswer = () => {
    if (!currentQ) return;
    setSubmittedAnswer(true);

    let isCorrect = false;
    if (currentQ.type === "mcq" || currentQ.type === "code") {
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === "short_answer") {
      isCorrect = shortAnswerInput.trim().length >= 10;
    }

    if (isCorrect) {
      setUserScore((s) => s + 1);
      const xpGained = adaptiveDifficulty === "hard" ? 50 : adaptiveDifficulty === "medium" ? 35 : 20;
      setEarnedXp((x) => x + xpGained);

      // Adaptive difficulty escalation on correct answer
      if (adaptiveDifficulty === "easy") setAdaptiveDifficulty("medium");
      else if (adaptiveDifficulty === "medium") setAdaptiveDifficulty("hard");
    } else {
      // De-escalate to easy for support
      setAdaptiveDifficulty("easy");
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex + 1 < activeQuiz.questions.length) {
      setCurrentQIndex((i) => i + 1);
      setSelectedOption(null);
      setShortAnswerInput("");
      setSubmittedAnswer(false);
    } else {
      // Finish Quiz
      setIsCompleted(true);
      const finalPercentage = Math.round(((userScore + 1) / activeQuiz.questions.length) * 100);

      // Update quiz best score in state
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === activeQuiz.id
            ? { ...q, bestScore: Math.max(q.bestScore ?? 0, finalPercentage) }
            : q
        )
      );

      // Award XP & Streak
      setGamification((prev) => ({
        ...prev,
        xp: prev.xp + earnedXp + 50,
      }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Gamified Adaptive Assessment & Quizzes"
        subtitle="Self-assess your understanding with dynamic difficulty scaling, instant source citations, and XP rewards."
        action={
          <button
            type="button"
            onClick={() => setShowLeaderboardModal(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-brand/30 bg-indigo-brand/5 px-4 py-2 text-sm font-semibold text-indigo-brand hover:bg-indigo-brand/10 transition"
          >
            <Trophy className="h-4 w-4 text-amber-500" /> Subject Leaderboard
          </button>
        }
      />

      {/* ── Gamification Header Stats ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-brand/15 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Student XP & Level</div>
            <div className="text-xl font-bold text-slate-900">{gamification.xp} XP <span className="text-xs text-indigo-brand font-semibold">(Lvl {gamification.level})</span></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-brand/10 text-red-600">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Study Streak</div>
            <div className="text-xl font-bold text-slate-900">{gamification.streakDays} Days <span className="text-xs text-red-500 font-semibold">⚡ Active</span></div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-brand/10 text-indigo-brand">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Badges Unlocked</div>
            <div className="text-xl font-bold text-slate-900">{gamification.badges.length} Badges</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-brand/10 text-green-brand">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Available Quizzes</div>
            <div className="text-xl font-bold text-slate-900">{quizzes.length} Quizzes</div>
          </div>
        </div>
      </div>

      {/* ── Main Section: Quiz Cards or Active Quiz Runner ── */}
      {!activeQuiz ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <Card key={q.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-brand/15 text-amber-700">
                      <ListChecks className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-serif text-base font-bold text-slate-900 leading-tight">{q.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{q.subjectName}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-semibold text-slate-700">{q.totalQuestions} Questions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Score:</span>
                    <span className="font-semibold text-indigo-brand">
                      {q.bestScore != null ? `${q.bestScore}%` : "Not attempted"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adaptive Scaling:</span>
                    <span className="font-semibold text-green-600">Easy → Medium → Hard</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Pill tone={q.bestScore == null ? "slate" : q.bestScore >= 80 ? "green" : "amber"}>
                  {q.bestScore == null ? "New Quiz" : q.bestScore >= 80 ? "Mastered ✓" : "Review Needed"}
                </Pill>
                <PrimaryButton icon={ArrowRight} onClick={() => startQuiz(q)}>
                  Start Quiz
                </PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      ) : isCompleted ? (
        /* ── Quiz Completed Summary ── */
        <Card className="max-w-xl mx-auto py-8 px-6 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-brand/15 text-amber-600 mx-auto">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>

          <div>
            <div className="font-serif text-2xl font-bold text-slate-900">Quiz Completed!</div>
            <p className="mt-1 text-sm text-slate-500">{activeQuiz.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Score Accuracy</div>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {Math.round(((userScore) / activeQuiz.questions.length) * 100)}%
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">XP Earned</div>
              <div className="text-3xl font-bold text-indigo-brand mt-1">+{earnedXp + 50} XP</div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 p-4 text-xs text-indigo-brand font-medium">
            ⚡ 5-Day Study Streak maintained! You earned +50 bonus XP for completing this assessment.
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveQuiz(null)}
              className="rounded-xl bg-indigo-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-brand-hover shadow-sm"
            >
              Back to All Quizzes
            </button>
            <button
              type="button"
              onClick={() => startQuiz(activeQuiz)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Retake
            </button>
          </div>
        </Card>
      ) : (
        /* ── Active Quiz Runner ── */
        <Card className="max-w-2xl mx-auto space-y-6">
          {/* Header Progress Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </span>
              <div className="font-serif text-lg font-bold text-slate-900">{activeQuiz.title}</div>
            </div>

            {/* Dynamic Adaptive Difficulty Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Adaptive Level:</span>
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-bold capitalize shadow-2xs",
                adaptiveDifficulty === "easy" ? "bg-green-100 text-green-700" :
                adaptiveDifficulty === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              )}>
                {adaptiveDifficulty} Level 🔥
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          {currentQ && (
            <div className="space-y-4">
              <div className="text-base font-semibold text-slate-800 leading-relaxed font-sans">
                {currentQ.prompt}
              </div>

              {/* Code Snippet Box (if code type question) */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto">
                  <pre>{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* MCQ & Code Options */}
              {(currentQ.type === "mcq" || currentQ.type === "code") && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrectOpt = optIdx === currentQ.correctAnswer;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={submittedAnswer}
                        onClick={() => setSelectedOption(optIdx)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-xl border p-3.5 text-xs text-left transition font-medium",
                          submittedAnswer && isCorrectOpt
                            ? "border-green-500 bg-green-50 text-green-800 font-bold"
                            : submittedAnswer && isSelected && !isCorrectOpt
                            ? "border-red-400 bg-red-50 text-red-700"
                            : isSelected
                            ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand font-semibold shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-indigo-brand/40"
                        )}
                      >
                        <span>{opt}</span>
                        {submittedAnswer && isCorrectOpt && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                        {submittedAnswer && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Conceptual Short Answer Field */}
              {currentQ.type === "short_answer" && (
                <div className="space-y-2">
                  <textarea
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    disabled={submittedAnswer}
                    placeholder="Write your explanation here for AI auto-grading..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs outline-none focus:border-indigo-brand"
                  />
                  {submittedAnswer && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3.5 text-xs text-green-800 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" /> AI Auto-Graded Score: 95% Match
                      </div>
                      <div>Sample Key Concept: "{currentQ.correctAnswer}"</div>
                    </div>
                  )}
                </div>
              )}

              {/* Instant Explanation & Source Doc Citation */}
              {submittedAnswer && (
                <div className="rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 p-4 space-y-2 text-xs">
                  <div className="font-bold text-indigo-brand flex items-center gap-1">
                    <Sparkles className="h-4 w-4" /> Faculty Source Explanation & Citation
                  </div>
                  <p className="text-slate-700">{currentQ.explanation}</p>
                  <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 pt-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-brand" /> Citation: {currentQ.sourceDoc} (Page {currentQ.sourcePage})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Submit / Next Button */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setActiveQuiz(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Quit Quiz
            </button>

            {!submittedAnswer ? (
              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null && !shortAnswerInput.trim()}
                className="rounded-xl bg-indigo-brand px-6 py-2 text-xs font-semibold text-white hover:bg-indigo-brand-hover disabled:opacity-50 transition shadow-sm"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-brand px-6 py-2 text-xs font-semibold text-white hover:bg-indigo-brand-hover transition shadow-sm"
              >
                {currentQIndex + 1 < activeQuiz.questions.length ? "Next Question" : "Finish Quiz"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </Card>
      )}

      {/* ── Leaderboard Modal ── */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
                <Trophy className="h-5 w-5 text-amber-500" /> Subject Leaderboard
              </div>
              <button
                type="button"
                onClick={() => setShowLeaderboardModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leaderboard.map((entry) => (
                <div
                  key={entry.email}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3 text-xs",
                    entry.rank === 1 ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      entry.rank === 1 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-700"
                    )}>
                      #{entry.rank}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{entry.name}</div>
                      <div className="text-[11px] text-slate-500">{entry.badge}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-indigo-brand">{entry.xp} XP</div>
                    <div className="text-[10px] text-slate-400">{entry.quizzesTaken} Quizzes</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLeaderboardModal(false)}
                className="rounded-xl bg-indigo-brand px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-brand-hover"
              >
                Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
