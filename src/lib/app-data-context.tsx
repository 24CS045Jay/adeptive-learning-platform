/**
 * AppDataContext — reactive store with localStorage persistence for all mutable app data.
 *
 * Phase 7: AI Answer Feedback & Rich Notifications.
 * Phase 8: Student ML Risk Prediction & Research Metrics data store.
 * Phase 9: Security Hardening parameters.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  documents as initialDocs,
  subjects as initialSubjects,
  learningModules as initialModules,
  learningResources as initialResources,
  users as initialUsers,
  studentQueries as initialQueries,
  escalations as initialEscalations,
  announcements as initialAnnouncements,
  quizzes as initialQuizzes,
  weakTopics,
  bookmarks as initialBookmarks,
  topicVolume,
  chatSources,
  initialMultiModalChunks,
  conceptNodes as initialNodes,
  conceptEdges as initialEdges,
  type MultiModalChunk,
  type ConceptNode,
  type ConceptEdge,
} from "@/lib/mock-data";
import type {
  FileType, Difficulty, LearningModule, LearningResource,
} from "@/lib/mock-data";
import { _setGlobalOnRegister } from "@/lib/auth";
import { AUDIT_LOG, type AuditEntry, appendAudit } from "@/lib/auth-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocStatus = "pending" | "approved" | "rejected";

export interface AppDocument {
  id: string;
  name: string;
  fileType: FileType;
  subjectId: string;
  moduleId: string | null;
  topicTag: string;
  difficulty: Difficulty;
  semester: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  status: DocStatus;
  chunks: number;
  priority: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Faculty" | "Admin";
  status: "active" | "inactive";
  joinedAt: string;
  /** Tracks whether user is still on the admin-created default password */
  passwordStatus: "default" | "changed";
}

export interface AppSubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  faculty: string;
  syllabus: string;
  enrolledStudentIds: string[];
}

export interface AppQuery {
  id: string;
  student: string;
  subject: string;
  question: string;
  createdAt: string;
}

export interface AppEscalation {
  id: string;
  student: string;
  subject: string;
  question: string;
  status: "open" | "resolved";
  escalatedAt: string;
  facultyAnswer?: string;
  resolvedBy?: string;
}

export interface AppAnnouncement {
  id: string;
  title: string;
  message: string;
  scope: string;
  postedBy: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "approval" | "escalation" | "announcement" | "quiz" | "reminder" | "progress";
}

export interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: "Student" | "Faculty";
  subjectName: string;
  tags: string[];
  upvotes: number;
  createdAt: string;
  answers: Array<{
    id: string;
    author: string;
    authorRole: "Student" | "Faculty";
    content: string;
    createdAt: string;
    isFacultyVerified: boolean;
    upvotes: number;
  }>;
}

export interface AiFeedback {
  id: string;
  question: string;
  answer: string;
  isThumbsUp: boolean;
  comment?: string;
  timestamp: string;
}

export interface StudentRiskProfile {
  studentId: string;
  studentName: string;
  email: string;
  subject: string;
  trend: "Improving" | "Stable" | "Declining";
  risk: "Low" | "Medium" | "High";
  scorePct: number;
  weakTopicCount: number;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Document Approved", message: "Your document 'BDA Unit 1 - MapReduce.pdf' was approved by Admin.", timestamp: "10m ago", read: false, type: "approval font-medium" as any },
  { id: "n2", title: "New Quiz Published", message: "Dr. Nisha Shah published 'MapReduce Architecture Mastery'.", timestamp: "30m ago", read: false, type: "quiz" },
  { id: "n3", title: "Daily Study Reminder", message: "Keep your 5-day study streak alive! Spend 15 mins reviewing Big Data notes.", timestamp: "2h ago", read: false, type: "reminder" },
  { id: "n4", title: "Weekly Progress Summary", message: "Great job! Your quiz score accuracy improved by +12% this week.", timestamp: "1d ago", read: true, type: "progress" },
];

const INITIAL_FEEDBACK: AiFeedback[] = [
  { id: "fb1", question: "How does MapReduce handle stragglers?", answer: "Speculative execution launches duplicate tasks on alternative nodes...", isThumbsUp: true, timestamp: "Today" },
  { id: "fb2", question: "Explain bias variance tradeoff", answer: "Deeper trees fit training data tighter (lower bias) but increase variance...", isThumbsUp: true, timestamp: "Yesterday" },
  { id: "fb3", question: "Difference between VM and Container", answer: "Containers share host kernel whereas VMs run full guest OS...", isThumbsUp: false, comment: "Needed more details on PID namespaces.", timestamp: "2 days ago" },
];

export const INITIAL_RISK_PROFILES: StudentRiskProfile[] = [
  { studentId: "s101", studentName: "Aarav Patel", email: "student@charusat.edu.in", subject: "Big Data Analytics", trend: "Improving", risk: "Low", scorePct: 88, weakTopicCount: 1 },
  { studentId: "s102", studentName: "Meera Joshi", email: "meera@charusat.edu.in", subject: "Machine Learning", trend: "Declining", risk: "High", scorePct: 58, weakTopicCount: 4 },
  { studentId: "s103", studentName: "Kabir Singh", email: "kabir@charusat.edu.in", subject: "Big Data Analytics", trend: "Stable", risk: "Medium", scorePct: 72, weakTopicCount: 2 },
  { studentId: "s104", studentName: "Sana Khan", email: "sana@charusat.edu.in", subject: "Machine Learning", trend: "Improving", risk: "Low", scorePct: 82, weakTopicCount: 1 },
];

// ─── Context Value Interface ──────────────────────────────────────────────────

interface AppDataContextValue {
  documents:        AppDocument[];
  subjects:         AppSubject[];
  modules:          LearningModule[];
  resources:        LearningResource[];
  users:            AppUser[];
  queries:          AppQuery[];
  escalations:      AppEscalation[];
  announcements:    AppAnnouncement[];
  notifications:    AppNotification[];
  discussions:      DiscussionPost[];
  aiFeedback:       AiFeedback[];
  riskProfiles:     StudentRiskProfile[];
  multiModalChunks: MultiModalChunk[];
  conceptNodes:     ConceptNode[];
  conceptEdges:     ConceptEdge[];
  quizzes:          typeof initialQuizzes;
  weakTopics:       typeof weakTopics;
  bookmarks:        typeof initialBookmarks;
  topicVolume:      typeof topicVolume;
  chatSources:      typeof chatSources;

  // Document CRUD
  addDocument:     (doc: Omit<AppDocument, "id" | "chunks" | "priority" | "status">) => void;
  approveDocument: (id: string) => void;
  rejectDocument:  (id: string) => void;
  deleteDocument:  (id: string) => void;

  // Feedback & Notifications
  addAiFeedback: (question: string, answer: string, isThumbsUp: boolean, comment?: string) => void;
  markNotificationsAsRead: () => void;

  // Escalations CRUD & RAG Re-indexing
  addEscalation:     (question: string, subject: string, studentName: string) => void;
  resolveEscalation: (id: string, facultyAnswer: string, resolvedByName: string) => void;

  // Discussions CRUD
  addDiscussionPost: (post: Omit<DiscussionPost, "id" | "upvotes" | "createdAt" | "answers">) => void;
  addDiscussionAnswer: (postId: string, content: string, author: string, authorRole: "Student" | "Faculty") => void;
  upvotePost: (postId: string) => void;

  // Multi-Modal Chunk Reranking
  updateChunkWeight:  (chunkId: string, weight: number) => void;
  toggleChunkStatus:  (chunkId: string) => void;
  addMultiModalChunk: (chunk: Omit<MultiModalChunk, "id">) => void;

  // User CRUD
  addUser:            (user: Omit<AppUser, "id" | "joinedAt">) => void;
  removeUser:         (id: string) => void;
  toggleUserStatus:   (id: string) => void;
  markPasswordChanged:(email: string) => void;

  // Audit Log
  auditLog: AuditEntry[];
  logAudit: (actor: string, action: string, target: string) => void;

  // Subject CRUD
  addSubject:     (subject: Omit<AppSubject, "id" | "enrolledStudentIds">) => void;
  deleteSubject:  (id: string) => void;
  updateSyllabus: (subjectId: string, syllabus: string) => void;

  // Module / Resource CRUD
  addModule:       (mod: Omit<LearningModule, "id">) => void;
  removeModule:    (id: string) => void;
  addResource:     (res: Omit<LearningResource, "id">) => void;
  removeResource:  (id: string) => void;
  enrollStudent:   (subjectId: string, userId: string) => void;
  unenrollStudent: (subjectId: string, userId: string) => void;

  // Queries & Announcements
  addQuery: (q: Omit<AppQuery, "id">) => void;
  addAnnouncement:    (a: Omit<AppAnnouncement, "id" | "createdAt">) => void;
  deleteAnnouncement: (id: string) => void;
}

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`ai_tutor_${key}`);
    if (item) return JSON.parse(item);
  } catch {}
  return fallback;
}

function saveStorage<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`ai_tutor_${key}`, JSON.stringify(data));
  } catch {}
}

function seedDocuments(): AppDocument[] {
  return initialDocs.map((d) => ({
    id: d.id,
    name: d.name,
    fileType: d.fileType,
    subjectId: d.subjectId,
    moduleId: d.moduleId ?? null,
    topicTag: d.topicTag ?? "",
    difficulty: d.difficulty,
    semester: d.semester,
    uploadedBy: d.uploadedBy === "Dr. Nisha Shah" ? "faculty@charusat.edu.in" : "priya@charusat.edu.in",
    uploadedByName: d.uploadedBy,
    uploadDate: d.uploadDate,
    status: d.status as DocStatus,
    chunks: d.chunks,
    priority: d.priority,
  }));
}

function seedUsers(): AppUser[] {
  return initialUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as AppUser["role"],
    status: u.status as AppUser["status"],
    joinedAt: "2026-07-01",
    passwordStatus: "changed" as const, // seeded demo accounts are not in default-pw state
  }));
}

function seedSubjects(): AppSubject[] {
  return initialSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    semester: s.semester,
    faculty: s.faculty,
    syllabus: s.syllabus ?? "",
    enrolledStudentIds: [...(s.enrolledStudentIds ?? [])],
  }));
}

// ─── Provider Component ───────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<AppDocument[]>(() => loadStorage("documents", seedDocuments()));
  const [subjects, setSubjects]   = useState<AppSubject[]>(() => loadStorage("subjects", seedSubjects()));
  const [modules, setModules]     = useState<LearningModule[]>(() => loadStorage("modules", [...initialModules]));
  const [resources, setResources] = useState<LearningResource[]>(() => loadStorage("resources", [...initialResources]));
  const [users, setUsers]         = useState<AppUser[]>(() => loadStorage("users", seedUsers()));
  const [queries, setQueries]     = useState<AppQuery[]>(() => loadStorage("queries", [...initialQueries]));
  const [escalations, setEscalations] = useState<AppEscalation[]>(() => loadStorage("escalations", [...initialEscalations] as AppEscalation[]));
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>(() => loadStorage("announcements", [...initialAnnouncements]));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStorage("notifications", INITIAL_NOTIFICATIONS));
  const [discussions, setDiscussions]     = useState<DiscussionPost[]>(() => loadStorage("discussions", []));
  const [aiFeedback, setAiFeedback]       = useState<AiFeedback[]>(() => loadStorage("ai_feedback", INITIAL_FEEDBACK));
  const [riskProfiles]                     = useState<StudentRiskProfile[]>(INITIAL_RISK_PROFILES);
  const [multiModalChunks, setMultiModalChunks] = useState<MultiModalChunk[]>(() => loadStorage("multimodal_chunks", [...initialMultiModalChunks]));
  const [conceptNodes] = useState<ConceptNode[]>([...initialNodes]);
  const [conceptEdges] = useState<ConceptEdge[]>([...initialEdges]);

  useEffect(() => saveStorage("documents", documents), [documents]);
  useEffect(() => saveStorage("subjects", subjects), [subjects]);
  useEffect(() => saveStorage("modules", modules), [modules]);
  useEffect(() => saveStorage("resources", resources), [resources]);
  useEffect(() => saveStorage("users", users), [users]);
  useEffect(() => saveStorage("queries", queries), [queries]);
  useEffect(() => saveStorage("escalations", escalations), [escalations]);
  useEffect(() => saveStorage("announcements", announcements), [announcements]);
  useEffect(() => saveStorage("notifications", notifications), [notifications]);
  useEffect(() => saveStorage("ai_feedback", aiFeedback), [aiFeedback]);
  useEffect(() => saveStorage("multimodal_chunks", multiModalChunks), [multiModalChunks]);

  useEffect(() => {
    _setGlobalOnRegister((name, email, role) => {
      const roleLabel = (role.charAt(0).toUpperCase() + role.slice(1)) as AppUser["role"];
      setUsers((prev) => {
        if (prev.some((u) => u.email.toLowerCase() === email.toLowerCase())) return prev;
        return [...prev, { id: `u_${Date.now()}`, name, email, role: roleLabel, status: "active", joinedAt: new Date().toISOString().split("T")[0], passwordStatus: "changed" }];
      });
    });
  }, []);

  const addDocument = useCallback((doc: Omit<AppDocument, "id" | "chunks" | "priority" | "status">) => {
    const newDoc: AppDocument = { ...doc, id: `d_${Date.now()}`, status: "pending", chunks: 0, priority: documents.length + 1 };
    setDocuments((prev) => [newDoc, ...prev]);
  }, [documents.length]);

  const approveDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: "approved", chunks: Math.floor(Math.random() * 200) + 100 } : d)));
  }, []);

  const rejectDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: "rejected" } : d)));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addAiFeedback = useCallback((question: string, answer: string, isThumbsUp: boolean, comment?: string) => {
    const newFb: AiFeedback = { id: `fb_${Date.now()}`, question, answer, isThumbsUp, comment, timestamp: "Just now" };
    setAiFeedback((prev) => [newFb, ...prev]);
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addEscalation = useCallback((question: string, subject: string, studentName: string) => {
    const newEsc: AppEscalation = { id: `e_${Date.now()}`, student: studentName, subject, question, status: "open", escalatedAt: "Just now" };
    setEscalations((prev) => [newEsc, ...prev]);
  }, []);

  const resolveEscalation = useCallback((id: string, facultyAnswer: string, resolvedByName: string) => {
    setEscalations((prev) => prev.map((e) => (e.id === id ? { ...e, status: "resolved", facultyAnswer, resolvedBy: resolvedByName } : e)));
  }, []);

  const addDiscussionPost = useCallback((post: Omit<DiscussionPost, "id" | "upvotes" | "createdAt" | "answers">) => {
    const newPost: DiscussionPost = { ...post, id: `p_${Date.now()}`, upvotes: 1, createdAt: "Just now", answers: [] };
    setDiscussions((prev) => [newPost, ...prev]);
  }, []);

  const addDiscussionAnswer = useCallback((postId: string, content: string, author: string, authorRole: "Student" | "Faculty") => {
    setDiscussions((prev) => prev.map((p) => (p.id === postId ? { ...p, answers: [...p.answers, { id: `ans_${Date.now()}`, author, authorRole, content, createdAt: "Just now", isFacultyVerified: authorRole === "Faculty", upvotes: 1 }] } : p)));
  }, []);

  const upvotePost = useCallback((postId: string) => {
    setDiscussions((prev) => prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p)));
  }, []);

  const updateChunkWeight = useCallback((chunkId: string, weight: number) => {
    setMultiModalChunks((prev) => prev.map((c) => (c.id === chunkId ? { ...c, weight } : c)));
  }, []);

  const toggleChunkStatus = useCallback((chunkId: string) => {
    setMultiModalChunks((prev) => prev.map((c) => (c.id === chunkId ? { ...c, status: c.status === "active" ? "deprecated" : "active" } : c)));
  }, []);

  const addMultiModalChunk = useCallback((chunk: Omit<MultiModalChunk, "id">) => {
    setMultiModalChunks((prev) => [{ ...chunk, id: `mmc_${Date.now()}` }, ...prev]);
  }, []);

  const addUser = useCallback((user: Omit<AppUser, "id" | "joinedAt">) => {
    setUsers((prev) => [
      ...prev,
      {
        ...user,
        id: `u_${Date.now()}`,
        joinedAt: new Date().toISOString().split("T")[0],
        passwordStatus: (user.passwordStatus ?? "default") as AppUser["passwordStatus"],
      },
    ]);
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)));
  }, []);

  const markPasswordChanged = useCallback((email: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === email.toLowerCase() ? { ...u, passwordStatus: "changed" as const } : u
      )
    );
  }, []);

  const logAudit = useCallback((actor: string, action: string, target: string) => {
    appendAudit(actor, action, target);
  }, []);

  const addSubject = useCallback((subj: Omit<AppSubject, "id" | "enrolledStudentIds">) => {
    setSubjects((prev) => [...prev, { ...subj, id: `s_${Date.now()}`, enrolledStudentIds: [] }]);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSyllabus = useCallback((subjectId: string, syllabus: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, syllabus } : s)));
  }, []);

  const addModule = useCallback((mod: Omit<LearningModule, "id">) => {
    setModules((prev) => [...prev, { ...mod, id: `m_${Date.now()}` }]);
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addResource = useCallback((res: Omit<LearningResource, "id">) => {
    setResources((prev) => [...prev, { ...res, id: `r_${Date.now()}` }]);
  }, []);

  const removeResource = useCallback((id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const enrollStudent = useCallback((subjectId: string, userId: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === subjectId && !s.enrolledStudentIds.includes(userId) ? { ...s, enrolledStudentIds: [...s.enrolledStudentIds, userId] } : s)));
  }, []);

  const unenrollStudent = useCallback((subjectId: string, userId: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, enrolledStudentIds: s.enrolledStudentIds.filter((id) => id !== userId) } : s)));
  }, []);

  const addQuery = useCallback((q: Omit<AppQuery, "id">) => {
    setQueries((prev) => [{ ...q, id: `q_${Date.now()}` }, ...prev]);
  }, []);

  const addAnnouncement = useCallback((a: Omit<AppAnnouncement, "id" | "createdAt">) => {
    setAnnouncements((prev) => [{ ...a, id: `a_${Date.now()}`, createdAt: "Just now" }, ...prev]);
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        documents,
        subjects,
        modules,
        resources,
        users,
        queries,
        escalations,
        announcements,
        notifications,
        discussions,
        aiFeedback,
        riskProfiles,
        multiModalChunks,
        conceptNodes,
        conceptEdges,
        quizzes: initialQuizzes,
        weakTopics,
        bookmarks: initialBookmarks,
        topicVolume,
        chatSources,
        addDocument,
        approveDocument,
        rejectDocument,
        deleteDocument,
        addAiFeedback,
        markNotificationsAsRead,
        addEscalation,
        resolveEscalation,
        addDiscussionPost,
        addDiscussionAnswer,
        upvotePost,
        updateChunkWeight,
        toggleChunkStatus,
        addMultiModalChunk,
        addUser,
        removeUser,
        toggleUserStatus,
        addSubject,
        deleteSubject,
        updateSyllabus,
        addModule,
        removeModule,
        addResource,
        removeResource,
        enrollStudent,
        unenrollStudent,
        addQuery,
        addAnnouncement,
        deleteAnnouncement,
        markPasswordChanged,
        auditLog: AUDIT_LOG,
        logAudit,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
