export type Role = "student" | "faculty" | "admin";

export const currentUsers: Record<Role, { name: string; email: string; role: string }> = {
  student: { name: "Aarav Patel", email: "student@charusat.edu.in", role: "Student" },
  faculty: { name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", role: "Faculty" },
  admin: { name: "Rahul Mehta", email: "admin@charusat.edu.in", role: "Admin" },
};

// ─── Subjects ────────────────────────────────────────────────────────────────

export const subjects = [
  {
    id: "s1",
    name: "Big Data Analytics",
    code: "CSE501",
    semester: 5,
    faculty: "Dr. Nisha Shah",
    syllabus: "This course covers distributed data processing frameworks including Hadoop MapReduce, Apache Spark, and streaming pipelines. Students will learn to design scalable data pipelines, perform batch and stream processing, and analyse large datasets using cluster computing paradigms.",
    enrolledStudentIds: ["u1", "u2", "u3"],
  },
  {
    id: "s2",
    name: "Machine Learning",
    code: "CSE502",
    semester: 5,
    faculty: "Dr. Nisha Shah",
    syllabus: "Covers supervised, unsupervised and reinforcement learning algorithms, feature engineering, model evaluation, regularisation, ensemble methods, and an introduction to deep learning with practical assignments.",
    enrolledStudentIds: ["u1", "u3"],
  },
  {
    id: "s3",
    name: "Cloud Computing",
    code: "CSE503",
    semester: 5,
    faculty: "Prof. Anil Kumar",
    syllabus: "Introduction to cloud service models (IaaS, PaaS, SaaS), major cloud providers (AWS, GCP, Azure), virtualisation, containers, serverless computing, and cloud security fundamentals.",
    enrolledStudentIds: ["u1", "u2"],
  },
  {
    id: "s4",
    name: "Distributed Systems",
    code: "CSE601",
    semester: 6,
    faculty: "Dr. Priya Rao",
    syllabus: "Distributed computing models, consensus algorithms (Paxos, Raft), CAP theorem, consistency models, distributed transactions, and fault tolerance strategies.",
    enrolledStudentIds: ["u2", "u3"],
  },
  {
    id: "s5",
    name: "Computer Networks",
    code: "CSE401",
    semester: 4,
    faculty: "Prof. Anil Kumar",
    syllabus: "OSI and TCP/IP models, routing protocols, transport layer (TCP/UDP), application protocols (HTTP, DNS, SMTP), network security, and wireless networks.",
    enrolledStudentIds: ["u1"],
  },
  {
    id: "s6",
    name: "Operating Systems",
    code: "CSE402",
    semester: 4,
    faculty: "Dr. Nisha Shah",
    syllabus: "Process management, CPU scheduling algorithms, memory management, virtual memory, file systems, I/O systems, and deadlock handling.",
    enrolledStudentIds: ["u1", "u2", "u3"],
  },
];

// ─── Learning Modules ─────────────────────────────────────────────────────────

export type LearningModule = {
  id: string;
  subjectId: string;
  order: number;
  name: string;
  description?: string;
};

export const learningModules: LearningModule[] = [
  { id: "m1", subjectId: "s1", order: 1, name: "Unit 1 – MapReduce & HDFS", description: "Hadoop architecture, HDFS internals, MapReduce programming model and job execution." },
  { id: "m2", subjectId: "s1", order: 2, name: "Unit 2 – Apache Spark", description: "RDDs, DataFrames, Spark SQL, Spark Streaming and performance tuning." },
  { id: "m3", subjectId: "s1", order: 3, name: "Unit 3 – NoSQL Databases", description: "HBase, Cassandra, MongoDB – data models and use cases." },
  { id: "m4", subjectId: "s1", order: 4, name: "Unit 4 – Stream Processing", description: "Kafka, Flink, and real-time analytics pipelines." },

  { id: "m5", subjectId: "s2", order: 1, name: "Unit 1 – Supervised Learning", description: "Linear and logistic regression, decision trees, SVMs." },
  { id: "m6", subjectId: "s2", order: 2, name: "Unit 2 – Model Evaluation", description: "Cross-validation, bias-variance tradeoff, regularisation." },
  { id: "m7", subjectId: "s2", order: 3, name: "Unit 3 – Unsupervised Learning", description: "K-means, DBSCAN, PCA, autoencoders." },
  { id: "m8", subjectId: "s2", order: 4, name: "Unit 4 – Deep Learning Intro", description: "Neural network basics, backpropagation, CNNs." },

  { id: "m9",  subjectId: "s3", order: 1, name: "Unit 1 – Cloud Fundamentals", description: "IaaS, PaaS, SaaS, deployment models, major providers." },
  { id: "m10", subjectId: "s3", order: 2, name: "Unit 2 – Virtualisation & Containers", description: "VMs, Docker, Kubernetes orchestration." },
  { id: "m11", subjectId: "s3", order: 3, name: "Unit 3 – Serverless & Functions", description: "AWS Lambda, GCP Cloud Functions, event-driven patterns." },

  { id: "m12", subjectId: "s4", order: 1, name: "Unit 1 – Distributed Computing Models", description: "Client-server, P2P, time and clocks." },
  { id: "m13", subjectId: "s4", order: 2, name: "Unit 2 – Consensus Algorithms", description: "Paxos, Raft, leader election, log replication." },
  { id: "m14", subjectId: "s4", order: 3, name: "Unit 3 – CAP & Consistency", description: "CAP theorem, eventual consistency, strong consistency models." },

  { id: "m15", subjectId: "s6", order: 1, name: "Unit 1 – Process Management", description: "Process states, PCB, context switching, IPC." },
  { id: "m16", subjectId: "s6", order: 2, name: "Unit 2 – CPU Scheduling", description: "FCFS, SJF, Round Robin, Priority, Multilevel queues." },
  { id: "m17", subjectId: "s6", order: 3, name: "Unit 3 – Memory Management", description: "Paging, segmentation, TLB, virtual memory, page replacement." },
];

// ─── Learning Resources ───────────────────────────────────────────────────────

export type ResourceType = "link" | "pdf" | "pptx" | "docx" | "video";
export type LearningResource = {
  id: string;
  moduleId: string;
  name: string;
  type: ResourceType;
  url?: string;
  description?: string;
};

export const learningResources: LearningResource[] = [
  { id: "r1", moduleId: "m1", name: "MapReduce Original Paper (Google, 2004)", type: "link", url: "https://research.google/pubs/pub62/", description: "Foundational paper by Dean & Ghemawat." },
  { id: "r2", moduleId: "m1", name: "BDA Unit 1 Lecture Slides", type: "pptx", description: "Faculty slides for MapReduce & HDFS." },
  { id: "r3", moduleId: "m2", name: "Spark Programming Guide", type: "link", url: "https://spark.apache.org/docs/latest/rdd-programming-guide.html" },
  { id: "r4", moduleId: "m2", name: "BDA Unit 2 Notes", type: "pdf", description: "Chapter notes on Spark RDD, DataFrame." },
  { id: "r5", moduleId: "m5", name: "ML Unit 1 Lecture Notes", type: "pdf", description: "Supervised learning theory and examples." },
  { id: "r6", moduleId: "m6", name: "Bias-Variance Tradeoff Explainer", type: "link", url: "https://en.wikipedia.org/wiki/Bias%E2%80%93variance_tradeoff" },
  { id: "r7", moduleId: "m13", name: "Raft Consensus Animation", type: "link", url: "https://raft.github.io/" },
  { id: "r8", moduleId: "m16", name: "CPU Scheduling Algorithms Notes", type: "docx", description: "Worked examples for all scheduling algorithms." },
];

// ─── Documents (enriched metadata) ───────────────────────────────────────────

export type FileType = "pdf" | "pptx" | "docx";
export type Difficulty = "easy" | "medium" | "hard";

export const documents = [
  {
    id: "d1",
    name: "BDA Unit 1 - MapReduce.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s1",
    moduleId: "m1",
    topicTag: "MapReduce",
    difficulty: "medium" as Difficulty,
    semester: 5,
    uploadedBy: "Dr. Nisha Shah",
    uploadDate: "2026-07-01",
    status: "approved",
    chunks: 296,
    priority: 1,
  },
  {
    id: "d2",
    name: "BDA Unit 2 - Spark.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s1",
    moduleId: "m2",
    topicTag: "Apache Spark",
    difficulty: "medium" as Difficulty,
    semester: 5,
    uploadedBy: "Dr. Nisha Shah",
    uploadDate: "2026-07-05",
    status: "approved",
    chunks: 214,
    priority: 2,
  },
  {
    id: "d3",
    name: "ML Lecture Notes.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s2",
    moduleId: "m5",
    topicTag: "Supervised Learning",
    difficulty: "easy" as Difficulty,
    semester: 5,
    uploadedBy: "Dr. Nisha Shah",
    uploadDate: "2026-07-08",
    status: "approved",
    chunks: 412,
    priority: 1,
  },
  {
    id: "d4",
    name: "Cloud Slides Week 3.pptx",
    fileType: "pptx" as FileType,
    subjectId: "s3",
    moduleId: "m10",
    topicTag: "Containers",
    difficulty: "easy" as Difficulty,
    semester: 5,
    uploadedBy: "Prof. Anil Kumar",
    uploadDate: "2026-07-10",
    status: "pending",
    chunks: 0,
    priority: 3,
  },
  {
    id: "d5",
    name: "DS Consensus.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s4",
    moduleId: "m13",
    topicTag: "Consensus Algorithms",
    difficulty: "hard" as Difficulty,
    semester: 6,
    uploadedBy: "Dr. Priya Rao",
    uploadDate: "2026-07-12",
    status: "approved",
    chunks: 178,
    priority: 2,
  },
  {
    id: "d6",
    name: "OS Scheduling.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s6",
    moduleId: "m16",
    topicTag: "CPU Scheduling",
    difficulty: "medium" as Difficulty,
    semester: 4,
    uploadedBy: "Dr. Nisha Shah",
    uploadDate: "2026-07-14",
    status: "rejected",
    chunks: 0,
    priority: 5,
  },
  {
    id: "d7",
    name: "Networks Unit 4.pdf",
    fileType: "pdf" as FileType,
    subjectId: "s5",
    moduleId: null,
    topicTag: "TCP/IP",
    difficulty: "easy" as Difficulty,
    semester: 4,
    uploadedBy: "Prof. Anil Kumar",
    uploadDate: "2026-07-15",
    status: "pending",
    chunks: 0,
    priority: 4,
  },
  {
    id: "d8",
    name: "ML Advanced Topics.docx",
    fileType: "docx" as FileType,
    subjectId: "s2",
    moduleId: "m8",
    topicTag: "Deep Learning",
    difficulty: "hard" as Difficulty,
    semester: 5,
    uploadedBy: "Dr. Nisha Shah",
    uploadDate: "2026-07-18",
    status: "approved",
    chunks: 187,
    priority: 2,
  },
];

// ─── Multi-Modal Document Chunks ──────────────────────────────────────────────

export type ArtifactType = "diagram" | "table" | "equation" | "slide_preview";

export interface MultiModalChunk {
  id: string;
  docId: string;
  docName: string;
  fileType: FileType;
  subjectName: string;
  unit: string;
  pageOrSlide: number;
  text: string;
  weight: number; // 1 to 5 stars
  status: "active" | "deprecated";
  artifact?: {
    type: ArtifactType;
    title: string;
    caption: string;
    badge: string;
  };
}

export const initialMultiModalChunks: MultiModalChunk[] = [
  {
    id: "mmc_1",
    docId: "d1",
    docName: "BDA Unit 1 - MapReduce.pdf",
    fileType: "pdf",
    subjectName: "Big Data Analytics",
    unit: "Unit 1",
    pageOrSlide: 14,
    text: "MapReduce Architecture: Input splits are processed by Map tasks on DataNodes local to the HDFS blocks. Output key-value pairs are sorted and shuffled across the network to Reduce tasks.",
    weight: 5,
    status: "active",
    artifact: {
      type: "diagram",
      title: "Figure 1.2 — MapReduce Dataflow Architecture",
      caption: "Input Splits → Map Phase → Shuffle & Sort → Reduce Phase → HDFS Output",
      badge: "Extracted Diagram",
    },
  },
  {
    id: "mmc_2",
    docId: "d2",
    docName: "BDA Unit 2 - Spark.pdf",
    fileType: "pdf",
    subjectName: "Big Data Analytics",
    unit: "Unit 2",
    pageOrSlide: 22,
    text: "Spark Catalyst Optimizer transforms logical execution plans into physical RDD DAGs using pattern-matching rules and cost-based optimization.",
    weight: 4,
    status: "active",
    artifact: {
      type: "diagram",
      title: "Figure 2.4 — Catalyst Optimizer Pipeline",
      caption: "Unresolved Logical Plan → Logical Plan → Optimized Logical Plan → Physical Plans → Cost Model",
      badge: "Extracted Figure",
    },
  },
  {
    id: "mmc_3",
    docId: "d4",
    docName: "Cloud Slides Week 3.pptx",
    fileType: "pptx",
    subjectName: "Cloud Computing",
    unit: "Unit 2",
    pageOrSlide: 8,
    text: "Docker Container Isolation vs Virtual Machine Hypervisors. Speaker Note: Emphasize that containers share kernel namespaces while VMs virtualize hardware.",
    weight: 4,
    status: "active",
    artifact: {
      type: "slide_preview",
      title: "Slide 8 — VM vs Docker Architecture Comparison",
      caption: "Slide visual layout + embedded Speaker Notes included in vector index.",
      badge: "Slide + Notes",
    },
  },
  {
    id: "mmc_4",
    docId: "d8",
    docName: "ML Advanced Topics.docx",
    fileType: "docx",
    subjectName: "Machine Learning",
    unit: "Unit 4",
    pageOrSlide: 5,
    text: "Backpropagation Equation: Delta rule computation for hidden layer weight matrix W_l with learning rate eta and activation derivative sigma_prime.",
    weight: 5,
    status: "active",
    artifact: {
      type: "equation",
      title: "Equation 4.3 — Weight Update Rule",
      caption: "ΔW_ij = -η * (∂E / ∂W_ij) = η * δ_i * a_j",
      badge: "LaTeX Equation",
    },
  },
  {
    id: "mmc_5",
    docId: "d3",
    docName: "ML Lecture Notes.pdf",
    fileType: "pdf",
    subjectName: "Machine Learning",
    unit: "Unit 2",
    pageOrSlide: 11,
    text: "Model Evaluation Metrics Matrix: Comparison of Precision, Recall, F1-Score, and ROC-AUC under imbalanced dataset conditions.",
    weight: 3,
    status: "active",
    artifact: {
      type: "table",
      title: "Table 2.1 — Classification Metrics Matrix",
      caption: "Columns: Metric, Formula, Best Use Case, Sensitivity to Outliers",
      badge: "Structured Table",
    },
  },
];

// ─── Interactive Knowledge Graph Nodes & Edges ───────────────────────────────

export interface ConceptNode {
  id: string;
  label: string;
  subjectId: string;
  subjectName: string;
  domain: string;
  x: number;
  y: number;
  mastery: "mastered" | "weak" | "unread";
  summary: string;
  relatedDocNames: string[];
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export const conceptNodes: ConceptNode[] = [
  {
    id: "hdfs",
    label: "HDFS Block Storage",
    subjectId: "s1",
    subjectName: "Big Data Analytics",
    domain: "Storage Layer",
    x: 120,
    y: 140,
    mastery: "mastered",
    summary: "Replicated distributed file system storing 128MB data blocks across rack-separated DataNodes.",
    relatedDocNames: ["BDA Unit 1 - MapReduce.pdf"],
  },
  {
    id: "mapreduce",
    label: "MapReduce Framework",
    subjectId: "s1",
    subjectName: "Big Data Analytics",
    domain: "Batch Processing",
    x: 320,
    y: 120,
    mastery: "weak",
    summary: "Programming model for processing large data sets in parallel with Map, Shuffle, and Reduce stages.",
    relatedDocNames: ["BDA Unit 1 - MapReduce.pdf"],
  },
  {
    id: "spark",
    label: "Apache Spark RDD",
    subjectId: "s1",
    subjectName: "Big Data Analytics",
    domain: "In-Memory Engine",
    x: 520,
    y: 150,
    mastery: "weak",
    summary: "In-memory fault-tolerant collection of elements enabling 100x faster iterative graph and ML algorithms.",
    relatedDocNames: ["BDA Unit 2 - Spark.pdf"],
  },
  {
    id: "cap",
    label: "CAP Theorem",
    subjectId: "s4",
    subjectName: "Distributed Systems",
    domain: "Distributed Architecture",
    x: 250,
    y: 300,
    mastery: "weak",
    summary: "Trade-off theorem proving that distributed systems can guarantee at most 2 of Consistency, Availability, Partition tolerance.",
    relatedDocNames: ["DS Consensus.pdf"],
  },
  {
    id: "raft",
    label: "Raft Consensus",
    subjectId: "s4",
    subjectName: "Distributed Systems",
    domain: "Consensus Protocols",
    x: 460,
    y: 320,
    mastery: "mastered",
    summary: "Leader-based consensus protocol using log replication and randomized election timeouts.",
    relatedDocNames: ["DS Consensus.pdf"],
  },
  {
    id: "docker",
    label: "Docker Containers",
    subjectId: "s3",
    subjectName: "Cloud Computing",
    domain: "Containerization",
    x: 680,
    y: 280,
    mastery: "mastered",
    summary: "Lightweight isolated application runtime environments sharing host kernel namespaces.",
    relatedDocNames: ["Cloud Slides Week 3.pptx"],
  },
  {
    id: "bias_variance",
    label: "Bias-Variance Tradeoff",
    subjectId: "s2",
    subjectName: "Machine Learning",
    domain: "Statistical ML",
    x: 180,
    y: 480,
    mastery: "mastered",
    summary: "Decomposition of model error into underfitting (bias) and overfitting (variance).",
    relatedDocNames: ["ML Lecture Notes.pdf"],
  },
  {
    id: "backprop",
    label: "Backpropagation",
    subjectId: "s2",
    subjectName: "Machine Learning",
    domain: "Deep Learning",
    x: 420,
    y: 490,
    mastery: "unread",
    summary: "Gradient descent optimization via chain rule error propagation through neural network layers.",
    relatedDocNames: ["ML Advanced Topics.docx"],
  },
  {
    id: "paging",
    label: "Virtual Memory Paging",
    subjectId: "s6",
    subjectName: "Operating Systems",
    domain: "Memory Management",
    x: 650,
    y: 460,
    mastery: "weak",
    summary: "Hardware-supported memory abstraction mapping virtual pages to physical frame buffers.",
    relatedDocNames: ["OS Scheduling.pdf"],
  },
];

export const conceptEdges: ConceptEdge[] = [
  { id: "e1", source: "hdfs", target: "mapreduce", label: "provides data to" },
  { id: "e2", source: "mapreduce", target: "spark", label: "succeeded by" },
  { id: "e3", source: "mapreduce", target: "cap", label: "constrained by" },
  { id: "e4", source: "cap", target: "raft", label: "guarantees CP via" },
  { id: "e5", source: "spark", target: "docker", label: "deployed on" },
  { id: "e6", source: "raft", target: "docker", label: "orchestrated in" },
  { id: "e7", source: "bias_variance", target: "backprop", label: "regulates" },
  { id: "e8", source: "backprop", target: "paging", label: "memory-bounded by" },
];

// ─── Student Learning Profile ─────────────────────────────────────────────────

export type LearningStyle = "visual" | "textual" | "example-driven";

export type StudentLearningProfile = {
  studentId: string;
  learningStyle: LearningStyle;
  learningGoals: string;
  currentSemester: number;
  totalStudyTimeMinutes: number;
  currentStreakDays: number;
  topicsCompleted: string[];
  topicsViewed: string[];
  weakConcepts: string[];
  strongConcepts: string[];
  quizScoreHistory: Array<{ quizId: string; subject: string; score: number; total: number; date: string }>;
};

export const studentLearningProfiles: Record<string, StudentLearningProfile> = {
  u1: {
    studentId: "u1",
    learningStyle: "example-driven",
    learningGoals: "Master Big Data and ML concepts for a data engineering internship.",
    currentSemester: 5,
    totalStudyTimeMinutes: 840,
    currentStreakDays: 5,
    topicsCompleted: ["MapReduce", "HDFS", "Supervised Learning"],
    topicsViewed: ["MapReduce", "HDFS", "Apache Spark", "Supervised Learning", "Model Evaluation", "Containers"],
    weakConcepts: ["MapReduce shuffle & sort", "CAP theorem tradeoffs", "Page replacement algorithms"],
    strongConcepts: ["HDFS architecture", "Logistic Regression", "Decision Trees"],
    quizScoreHistory: [
      { quizId: "qz1", subject: "Big Data Analytics", score: 9, total: 12, date: "2026-07-20" },
      { quizId: "qz2", subject: "Machine Learning", score: 13, total: 15, date: "2026-07-22" },
      { quizId: "qz4", subject: "Operating Systems", score: 12, total: 20, date: "2026-07-23" },
    ],
  },
  u2: {
    studentId: "u2",
    learningStyle: "visual",
    learningGoals: "Prepare for semester exams and build a cloud project.",
    currentSemester: 5,
    totalStudyTimeMinutes: 540,
    currentStreakDays: 2,
    topicsCompleted: ["Cloud Fundamentals"],
    topicsViewed: ["Cloud Fundamentals", "Containers", "MapReduce", "Consensus Algorithms"],
    weakConcepts: ["Consistent hashing", "Raft leader election"],
    strongConcepts: ["Cloud Service Models", "Docker basics"],
    quizScoreHistory: [
      { quizId: "qz1", subject: "Big Data Analytics", score: 7, total: 12, date: "2026-07-21" },
    ],
  },
};

// ─── Unchanged data ───────────────────────────────────────────────────────────

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
  { id: "u1", name: "Aarav Patel",    email: "student@charusat.edu.in", role: "Student", status: "active" },
  { id: "u2", name: "Meera Joshi",    email: "meera@charusat.edu.in",   role: "Student", status: "active" },
  { id: "u3", name: "Kabir Singh",    email: "kabir@charusat.edu.in",   role: "Student", status: "active" },
  { id: "u4", name: "Sana Khan",      email: "sana@charusat.edu.in",    role: "Student", status: "inactive" },
  { id: "u5", name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", role: "Faculty", status: "active" },
  { id: "u6", name: "Prof. Anil Kumar", email: "anil@charusat.edu.in", role: "Faculty", status: "active" },
  { id: "u7", name: "Dr. Priya Rao",  email: "priya@charusat.edu.in",   role: "Faculty", status: "active" },
  { id: "u8", name: "Rahul Mehta",    email: "admin@charusat.edu.in",   role: "Admin",   status: "active" },
];

export const auditLogs = [
  { id: "l1", time: "2026-07-23 10:42", actor: "admin@charusat.edu.in",   action: "APPROVE_DOCUMENT", details: '{"documentId":"d3"}' },
  { id: "l2", time: "2026-07-23 10:12", actor: "faculty@charusat.edu.in", action: "UPLOAD_DOCUMENT",  details: '{"documentId":"d7","subject":"CSE401"}' },
  { id: "l3", time: "2026-07-23 09:58", actor: "admin@charusat.edu.in",   action: "LOGIN",             details: '{"email":"admin@charusat.edu.in"}' },
  { id: "l4", time: "2026-07-22 18:20", actor: "faculty@charusat.edu.in", action: "APPROVE_DOCUMENT", details: '{"documentId":"d5"}' },
  { id: "l5", time: "2026-07-22 16:03", actor: "student@charusat.edu.in", action: "LOGIN",             details: '{"email":"student@charusat.edu.in"}' },
  { id: "l6", time: "2026-07-22 14:47", actor: "admin@charusat.edu.in",   action: "UPLOAD_DOCUMENT",  details: '{"documentId":"d1"}' },
];

export const quizzes = [
  { id: "qz1", subject: "Big Data Analytics",  subjectId: "s1", questions: 12, bestScore: 75 },
  { id: "qz2", subject: "Machine Learning",    subjectId: "s2", questions: 15, bestScore: 88 },
  { id: "qz3", subject: "Cloud Computing",     subjectId: "s3", questions: 10, bestScore: null },
  { id: "qz4", subject: "Operating Systems",   subjectId: "s6", questions: 20, bestScore: 62 },
];

export const weakTopics = [
  { topic: "MapReduce shuffle & sort", subject: "Big Data Analytics",  accuracy: 55, reason: "55% quiz accuracy" },
  { topic: "CAP theorem tradeoffs",    subject: "Distributed Systems", accuracy: 60, reason: "60% quiz accuracy" },
  { topic: "Page replacement algorithms", subject: "Operating Systems", accuracy: 62, reason: "62% quiz accuracy" },
];

export const bookmarks = [
  { id: "b1", question: "How does MapReduce handle stragglers?", answer: "Hadoop uses speculative execution — the framework launches backup copies of slow tasks and uses whichever finishes first...", subject: "Big Data Analytics", date: "2 days ago" },
  { id: "b2", question: "L1 vs L2 regularization?", answer: "L1 (Lasso) adds absolute value penalty and induces sparsity; L2 (Ridge) adds squared penalty and shrinks weights smoothly...", subject: "Machine Learning", date: "5 days ago" },
];

export const topicVolume = [
  { topic: "MapReduce",    asked: 42 },
  { topic: "Neural Nets",  asked: 38 },
  { topic: "Consensus",    asked: 27 },
  { topic: "Scheduling",   asked: 21 },
  { topic: "Virtualization", asked: 18 },
  { topic: "TCP/IP",       asked: 14 },
];

export const subjectActivity = subjects.map((s, i) => ({
  subject: s.name,
  approvedDocs: [3, 4, 2, 2, 1, 2][i] ?? 1,
  queries: [128, 96, 54, 41, 33, 27][i] ?? 10,
}));

export const chatSources = [
  { doc: "BDA Unit 1 - MapReduce.pdf", unit: "Unit 1" },
  { doc: "BDA Unit 2 - Spark.pdf",     unit: "Unit 2" },
];