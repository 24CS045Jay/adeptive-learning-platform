export type Role = "student" | "faculty" | "admin";

export const currentUsers: Record<Role, { name: string; email: string; role: string }> = {
  student: { name: "Aarav Patel", email: "student@charusat.edu.in", role: "Student" },
  faculty: { name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", role: "Faculty" },
  admin: { name: "Rahul Mehta", email: "admin@charusat.edu.in", role: "Admin" },
};

export const subjects = [
  { id: "s1", name: "Big Data Analytics", code: "CSE501", semester: 5, faculty: "Dr. Nisha Shah" },
  { id: "s2", name: "Machine Learning", code: "CSE502", semester: 5, faculty: "Dr. Nisha Shah" },
  { id: "s3", name: "Cloud Computing", code: "CSE503", semester: 5, faculty: "Prof. Anil Kumar" },
  { id: "s4", name: "Distributed Systems", code: "CSE601", semester: 6, faculty: "Dr. Priya Rao" },
  { id: "s5", name: "Computer Networks", code: "CSE401", semester: 4, faculty: "Prof. Anil Kumar" },
  { id: "s6", name: "Operating Systems", code: "CSE402", semester: 4, faculty: "Dr. Nisha Shah" },
];

export const documents = [
  { id: "d1", name: "BDA Unit 1 - MapReduce.pdf", subjectId: "s1", uploadedBy: "Dr. Nisha Shah", status: "approved", chunks: 296, priority: 1 },
  { id: "d2", name: "BDA Unit 2 - Spark.pdf", subjectId: "s1", uploadedBy: "Dr. Nisha Shah", status: "approved", chunks: 214, priority: 2 },
  { id: "d3", name: "ML Lecture Notes.pdf", subjectId: "s2", uploadedBy: "Dr. Nisha Shah", status: "approved", chunks: 412, priority: 1 },
  { id: "d4", name: "Cloud Slides Week 3.pptx", subjectId: "s3", uploadedBy: "Prof. Anil Kumar", status: "pending", chunks: 0, priority: 3 },
  { id: "d5", name: "DS Consensus.pdf", subjectId: "s4", uploadedBy: "Dr. Priya Rao", status: "approved", chunks: 178, priority: 2 },
  { id: "d6", name: "OS Scheduling.pdf", subjectId: "s6", uploadedBy: "Dr. Nisha Shah", status: "rejected", chunks: 0, priority: 5 },
  { id: "d7", name: "Networks Unit 4.pdf", subjectId: "s5", uploadedBy: "Prof. Anil Kumar", status: "pending", chunks: 0, priority: 4 },
];

export const studentQueries = [
  { id: "q1", student: "Aarav Patel", subject: "Big Data Analytics", question: "How does MapReduce handle stragglers?", createdAt: "2h ago" },
  { id: "q2", student: "Meera Joshi", subject: "Big Data Analytics", question: "Difference between Spark RDD and DataFrame?", createdAt: "3h ago" },
  { id: "q3", student: "Kabir Singh", subject: "Machine Learning", question: "When to use L1 vs L2 regularization?", createdAt: "5h ago" },
  { id: "q4", student: "Sana Khan", subject: "Machine Learning", question: "Explain bias-variance tradeoff with an example.", createdAt: "yesterday" },
];

export const escalations = [
  { id: "e1", student: "Meera Joshi", subject: "Big Data Analytics", question: "Real-world example of consistent hashing in Hadoop?", status: "open", escalatedAt: "1h ago" },
  { id: "e2", student: "Kabir Singh", subject: "Machine Learning", question: "Proof for VC dimension of neural nets?", status: "open", escalatedAt: "yesterday" },
  { id: "e3", student: "Aarav Patel", subject: "Cloud Computing", question: "How does GCP handle regional failover?", status: "resolved", escalatedAt: "2 days ago" },
];

export const announcements = [
  { id: "a1", title: "Mid-sem timetable published", message: "The mid-semester exam timetable is available on the student portal.", scope: "Institution", postedBy: "Admin Office", createdAt: "Today" },
  { id: "a2", title: "AI Tutor v2 launched", message: "New RAG-powered tutor with citation support is now live for all CSE subjects.", scope: "Institution", postedBy: "Rahul Mehta", createdAt: "Yesterday" },
  { id: "a3", title: "BDA extra doubt session", message: "Extra doubt session for Big Data Analytics this Friday at 4pm.", scope: "Big Data Analytics", postedBy: "Dr. Nisha Shah", createdAt: "2 days ago" },
];

export const users = [
  { id: "u1", name: "Aarav Patel", email: "student@charusat.edu.in", role: "Student", status: "active" },
  { id: "u2", name: "Meera Joshi", email: "meera@charusat.edu.in", role: "Student", status: "active" },
  { id: "u3", name: "Kabir Singh", email: "kabir@charusat.edu.in", role: "Student", status: "active" },
  { id: "u4", name: "Sana Khan", email: "sana@charusat.edu.in", role: "Student", status: "inactive" },
  { id: "u5", name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", role: "Faculty", status: "active" },
  { id: "u6", name: "Prof. Anil Kumar", email: "anil@charusat.edu.in", role: "Faculty", status: "active" },
  { id: "u7", name: "Dr. Priya Rao", email: "priya@charusat.edu.in", role: "Faculty", status: "active" },
  { id: "u8", name: "Rahul Mehta", email: "admin@charusat.edu.in", role: "Admin", status: "active" },
];

export const auditLogs = [
  { id: "l1", time: "2026-07-23 10:42", actor: "admin@charusat.edu.in", action: "APPROVE_DOCUMENT", details: '{"documentId":"d3"}' },
  { id: "l2", time: "2026-07-23 10:12", actor: "faculty@charusat.edu.in", action: "UPLOAD_DOCUMENT", details: '{"documentId":"d7","subject":"CSE401"}' },
  { id: "l3", time: "2026-07-23 09:58", actor: "admin@charusat.edu.in", action: "LOGIN", details: '{"email":"admin@charusat.edu.in"}' },
  { id: "l4", time: "2026-07-22 18:20", actor: "faculty@charusat.edu.in", action: "APPROVE_DOCUMENT", details: '{"documentId":"d5"}' },
  { id: "l5", time: "2026-07-22 16:03", actor: "student@charusat.edu.in", action: "LOGIN", details: '{"email":"student@charusat.edu.in"}' },
  { id: "l6", time: "2026-07-22 14:47", actor: "admin@charusat.edu.in", action: "UPLOAD_DOCUMENT", details: '{"documentId":"d1"}' },
];

export const quizzes = [
  { id: "qz1", subject: "Big Data Analytics", subjectId: "s1", questions: 12, bestScore: 75 },
  { id: "qz2", subject: "Machine Learning", subjectId: "s2", questions: 15, bestScore: 88 },
  { id: "qz3", subject: "Cloud Computing", subjectId: "s3", questions: 10, bestScore: null },
  { id: "qz4", subject: "Operating Systems", subjectId: "s6", questions: 20, bestScore: 62 },
];

export const weakTopics = [
  { topic: "MapReduce shuffle & sort", subject: "Big Data Analytics", accuracy: 55, reason: "55% quiz accuracy" },
  { topic: "CAP theorem tradeoffs", subject: "Distributed Systems", accuracy: 60, reason: "60% quiz accuracy" },
  { topic: "Page replacement algorithms", subject: "Operating Systems", accuracy: 62, reason: "62% quiz accuracy" },
];

export const bookmarks = [
  { id: "b1", question: "How does MapReduce handle stragglers?", answer: "Hadoop uses speculative execution — the framework launches backup copies of slow tasks and uses whichever finishes first...", subject: "Big Data Analytics", date: "2 days ago" },
  { id: "b2", question: "L1 vs L2 regularization?", answer: "L1 (Lasso) adds absolute value penalty and induces sparsity; L2 (Ridge) adds squared penalty and shrinks weights smoothly...", subject: "Machine Learning", date: "5 days ago" },
];

export const topicVolume = [
  { topic: "MapReduce", asked: 42 },
  { topic: "Neural Nets", asked: 38 },
  { topic: "Consensus", asked: 27 },
  { topic: "Scheduling", asked: 21 },
  { topic: "Virtualization", asked: 18 },
  { topic: "TCP/IP", asked: 14 },
];

export const subjectActivity = subjects.map((s, i) => ({
  subject: s.name,
  approvedDocs: [3, 4, 2, 2, 1, 2][i] ?? 1,
  queries: [128, 96, 54, 41, 33, 27][i] ?? 10,
}));

export const chatSources = [
  { doc: "BDA Unit 1 - MapReduce.pdf", unit: "Unit 1" },
  { doc: "BDA Unit 2 - Spark.pdf", unit: "Unit 2" },
];