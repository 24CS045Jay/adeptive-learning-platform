/**
 * Quiz Store — Adaptive Quiz Engine, AI Quiz Generator, Gamification (XP, Streaks, Badges, Leaderboards)
 */

export type QuestionType = "mcq" | "code" | "short_answer";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string | number; // index for MCQ or string
  explanation: string;
  sourceDoc: string;
  sourcePage: number;
}

export interface Quiz {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  totalQuestions: number;
  bestScore: number | null; // e.g. 85%
  status: "published" | "draft";
  createdBy: string;
  questions: QuizQuestion[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  xp: number;
  badge: string;
  quizzesTaken: number;
}

export interface StudentGamificationState {
  xp: number;
  streakDays: number;
  level: number;
  badges: Array<{ id: string; name: string; icon: string; description: string; dateUnlocked: string }>;
}

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: "qz1",
    subjectId: "s1",
    subjectName: "Big Data Analytics",
    title: "MapReduce Architecture & HDFS Mastery",
    totalQuestions: 4,
    bestScore: 75,
    status: "published",
    createdBy: "Dr. Nisha Shah",
    questions: [
      {
        id: "q1_1",
        type: "mcq",
        difficulty: "easy",
        prompt: "Which HDFS daemon is responsible for managing file system metadata in RAM?",
        options: ["DataNode", "NameNode", "TaskTracker", "ResourceManager"],
        correctAnswer: 1, // NameNode
        explanation: "The NameNode maintains the file system namespace, block locations, and directory tree structures in RAM.",
        sourceDoc: "BDA Unit 1 - MapReduce.pdf",
        sourcePage: 4,
      },
      {
        id: "q1_2",
        type: "code",
        difficulty: "medium",
        prompt: "Predict the key-value pair output of the Map function for input text: 'hadoop spark hadoop':",
        codeSnippet: `def map_function(text):\n    for word in text.split():\n        yield (word, 1)`,
        options: [
          "[('hadoop', 2), ('spark', 1)]",
          "[('hadoop', 1), ('spark', 1), ('hadoop', 1)]",
          "[('hadoop spark hadoop', 1)]",
        ],
        correctAnswer: 1,
        explanation: "The Map step emits intermediate (word, 1) tuples for each token. Grouping and aggregation happen later during Shuffle & Reduce.",
        sourceDoc: "BDA Unit 1 - MapReduce.pdf",
        sourcePage: 14,
      },
      {
        id: "q1_3",
        type: "mcq",
        difficulty: "hard",
        prompt: "What mechanism does Hadoop use to prevent slow worker nodes ('stragglers') from delaying job completion?",
        options: ["Speculative Execution", "Combiner Aggregation", "Block Resharding", "Rack Awareness"],
        correctAnswer: 0,
        explanation: "Speculative execution launches duplicate tasks on alternative nodes and accepts whichever copy finishes first.",
        sourceDoc: "BDA Unit 1 - MapReduce.pdf",
        sourcePage: 18,
      },
      {
        id: "q1_4",
        type: "short_answer",
        difficulty: "medium",
        prompt: "Explain why Combiner functions are used between Map and Reduce stages.",
        correctAnswer: "Combiners act as mini-reducers on local Map nodes to aggregate data before network transfer, reducing network congestion.",
        explanation: "Combiner functions perform pre-aggregation on local map task outputs, significantly reducing cross-network shuffle volume.",
        sourceDoc: "BDA Unit 1 - MapReduce.pdf",
        sourcePage: 20,
      },
    ],
  },
  {
    id: "qz2",
    subjectId: "s2",
    subjectName: "Machine Learning",
    title: "Supervised Learning & Regularization",
    totalQuestions: 3,
    bestScore: 88,
    status: "published",
    createdBy: "Dr. Nisha Shah",
    questions: [
      {
        id: "q2_1",
        type: "mcq",
        difficulty: "easy",
        prompt: "Which activation function maps real-valued inputs to a probability range of [0, 1] in Logistic Regression?",
        options: ["ReLU", "Sigmoid", "Tanh", "Softmax"],
        correctAnswer: 1,
        explanation: "The Sigmoid function 1 / (1 + e^-z) squeezes input values into the (0, 1) range for binary classification.",
        sourceDoc: "ML Lecture Notes.pdf",
        sourcePage: 8,
      },
      {
        id: "q2_2",
        type: "mcq",
        difficulty: "medium",
        prompt: "L1 regularization (Lasso) differs from L2 regularization (Ridge) because L1:",
        options: [
          "Induces sparsity by shrinking coefficients to exactly zero",
          "Differentiates weights smoothly without zero values",
          "Increases model variance on noisy data",
        ],
        correctAnswer: 0,
        explanation: "L1 penalty uses absolute weights |w|, causing less important feature coefficients to drop to zero for feature selection.",
        sourceDoc: "ML Lecture Notes.pdf",
        sourcePage: 15,
      },
      {
        id: "q2_3",
        type: "short_answer",
        difficulty: "hard",
        prompt: "Describe the Bias-Variance tradeoff when increasing Decision Tree depth.",
        correctAnswer: "Increasing tree depth lowers bias (captures complex patterns) but increases variance (overfits training noise).",
        explanation: "Deeper trees fit training data tighter (lower bias) but become sensitive to small data variations (higher variance).",
        sourceDoc: "ML Lecture Notes.pdf",
        sourcePage: 22,
      },
    ],
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Aarav Patel", email: "student@charusat.edu.in", xp: 1450, badge: "Big Data Ninja 🥷", quizzesTaken: 8 },
  { rank: 2, name: "Meera Joshi", email: "meera@charusat.edu.in", xp: 1220, badge: "RAG Scholar 🎓", quizzesTaken: 6 },
  { rank: 3, name: "Kabir Singh", email: "kabir@charusat.edu.in", xp: 980, badge: "Streak Master ⚡", quizzesTaken: 5 },
  { rank: 4, name: "Sana Khan", email: "sana@charusat.edu.in", xp: 740, badge: "ML Explorer 🚀", quizzesTaken: 4 },
];

export const DEFAULT_GAMIFICATION: StudentGamificationState = {
  xp: 1450,
  streakDays: 5,
  level: 4,
  badges: [
    { id: "b1", name: "Big Data Ninja", icon: "🥷", description: "Scored >80% on 3 Big Data Analytics quizzes", dateUnlocked: "2026-07-20" },
    { id: "b2", name: "RAG Scholar", icon: "🎓", description: "Verified 20+ grounded citations in AI Tutor", dateUnlocked: "2026-07-22" },
    { id: "b3", name: "Streak Master", icon: "⚡", description: "Maintained a 5-day consecutive study streak", dateUnlocked: "2026-07-24" },
  ],
};

// ─── AI Quiz Generation Helper ────────────────────────────────────────────────

export function generateQuizFromDoc(docName: string, subjectName: string, createdBy: string): Quiz {
  const quizId = `qz_${Date.now()}`;
  return {
    id: quizId,
    subjectId: subjectName.toLowerCase().replace(/\s+/g, "_"),
    subjectName,
    title: `AI Quiz: ${docName.replace(/\.(pdf|pptx|docx)$/i, "")}`,
    totalQuestions: 5,
    bestScore: null,
    status: "published",
    createdBy,
    questions: [
      {
        id: `${quizId}_1`,
        type: "mcq",
        difficulty: "easy",
        prompt: `Based on '${docName}', what is the primary objective of this topic in ${subjectName}?`,
        options: [
          "To optimize system throughput and resource efficiency",
          "To store unindexed text files without replication",
          "To disable parallel processing workers",
        ],
        correctAnswer: 0,
        explanation: `Extracted from vector chunk 1 of ${docName}. Efficient parallel execution is the core goal.`,
        sourceDoc: docName,
        sourcePage: 2,
      },
      {
        id: `${quizId}_2`,
        type: "code",
        difficulty: "medium",
        prompt: `Review the code structure referenced in '${docName}'. What is the output?`,
        codeSnippet: `items = [1, 2, 3, 4]\nresult = [x * 2 for x in items if x % 2 == 0]\nprint(result)`,
        options: ["[2, 4, 6, 8]", "[4, 8]", "[2, 6]"],
        correctAnswer: 1,
        explanation: "Filters even numbers (2, 4) and doubles them, yielding [4, 8].",
        sourceDoc: docName,
        sourcePage: 6,
      },
      {
        id: `${quizId}_3`,
        type: "mcq",
        difficulty: "medium",
        prompt: `Which trade-off is highlighted in the unit notes of '${docName}'?`,
        options: [
          "High performance vs memory consumption",
          "Random access vs sequential throughput",
          "Network latency vs disk I/O bandwidth",
        ],
        correctAnswer: 0,
        explanation: `In-memory processing reduces I/O latency at the cost of higher RAM usage.`,
        sourceDoc: docName,
        sourcePage: 10,
      },
      {
        id: `${quizId}_4`,
        type: "short_answer",
        difficulty: "hard",
        prompt: `Summarize the core architectural guarantee explained in '${docName}'.`,
        correctAnswer: "High availability, fault tolerance, and scalable distributed computation.",
        explanation: "The document details fault recovery mechanisms and cluster scalability.",
        sourceDoc: docName,
        sourcePage: 14,
      },
      {
        id: `${quizId}_5`,
        type: "mcq",
        difficulty: "hard",
        prompt: `What is the key takeaway for end-semester exam questions regarding '${docName}'?`,
        options: [
          "Understanding key-value dataflows and architecture diagrams",
          "Memorizing exact syntax error codes",
          "Single-node non-scalable execution",
        ],
        correctAnswer: 0,
        explanation: "Exam questions focus on architectural diagrams and theoretical guarantees.",
        sourceDoc: docName,
        sourcePage: 18,
      },
    ],
  };
}
