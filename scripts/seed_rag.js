import "dotenv/config";
import mongoose from "mongoose";
import { Subject, Document, User } from "../models/index.js";

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

const SAMPLE_MATERIALS = [
  {
    subjectCode: "CSE501", // Big Data Analytics
    fileName: "Big_Data_Analytics_Unit1_Introduction.pdf",
    text: `
# Big Data Analytics — Course Unit 1: Introduction & Fundamentals

## What is Big Data?
Big Data refers to extremely large, complex, and fast-growing datasets that cannot be easily stored, managed, or processed using traditional relational database management systems (RDBMS). Big Data is defined by the 5 Vs model:
1. Volume: The vast scale of data generated every second from sensors, social media, transactions, and logs (terabytes to petabytes).
2. Velocity: The speed at which new data is generated, collected, and streamed in real-time.
3. Variety: The diverse formats of data including structured (SQL tables), semi-structured (JSON, XML), and unstructured (images, audio, videos, text).
4. Veracity: The trustworthiness, quality, and accuracy of the collected data.
5. Value: The actionable business insights and knowledge derived from analyzing the raw data.

## Hadoop Ecosystem Architecture
The Apache Hadoop ecosystem is an open-source framework designed for distributed storage and processing of massive datasets across clusters of commodity hardware.

### 1. Hadoop Distributed File System (HDFS)
HDFS is a master-slave architecture for distributed storage:
- NameNode: The master node that manages the file system namespace, directory tree, and metadata (block locations).
- DataNode: Worker nodes that store the actual data blocks (typically 128 MB per block) and handle block creation, deletion, and replication (default replication factor is 3).

### 2. MapReduce Execution Model
MapReduce is a programming paradigm for parallel processing:
- Map Phase: Takes raw key-value input pairs and applies a map function to emit intermediate key-value pairs.
- Shuffle & Sort Phase: Groups and sorts all intermediate values associated with the same key.
- Reduce Phase: Aggregates or summarizes grouped values for each key and outputs final results to HDFS.

## Apache Spark Overview
Apache Spark is a high-performance in-memory analytics engine. Unlike Hadoop MapReduce which relies heavily on disk I/O between phases, Spark keeps intermediate data in memory using Resilient Distributed Datasets (RDDs) and DataFrames, achieving up to 100x faster execution for iterative algorithms like Machine Learning and Graph Processing.
    `,
  },
  {
    subjectCode: "CSE402", // Operating Systems
    fileName: "Operating_Systems_Unit1_Concepts_and_Types.pdf",
    text: `
# Operating Systems — Course Unit 1: OS Concepts & Architecture

## What is an Operating System?
An Operating System (OS) is systemic software that acts as an intermediary interface between computer hardware components and the user or application software. The primary objectives of an operating system are convenience, efficiency, hardware abstraction, resource management, and execution control.

### Core Functions of an Operating System:
1. Process Management: Handles process creation, scheduling, synchronization, and termination.
2. Memory Management: Allocates and deallocates memory space (RAM) to processes, tracks memory usage, and handles virtual memory via paging/segmentation.
3. Storage & File System Management: Manages directory structures, file allocation tables (FAT, NTFS, ext4), read/write access permissions, and disk storage.
4. Device / I/O Management: Provides device drivers to abstract hardware complexities for peripherals like keyboards, displays, disk drives, and network cards.
5. Protection & Security: Ensures authorized access to system resources, user authentication, and data isolation between processes.

## Types of Operating Systems
Operating systems are classified based on their processing capabilities, user interaction, and scheduling mechanisms:

1. Batch Operating System:
   - Users do not interact directly with the OS. Jobs with similar requirements are collected, grouped into batches by an operator, and executed sequentially.
   - Example: Early IBM mainframe systems.

2. Time-Sharing / Multitasking Operating System:
   - Uses CPU scheduling (such as Round Robin) and multiprogramming to allow multiple users or programs to share CPU time concurrently. Switch time between tasks is so fast that users feel they have a dedicated machine.
   - Example: UNIX, Linux, Windows 10/11, macOS.

3. Distributed Operating System:
   - Manages a network of independent physical computers (nodes) communicating over a network, making them appear as a single unified computing system to end users.
   - Example: LOCUS, Plan 9.

4. Real-Time Operating System (RTOS):
   - Designed for systems where event processing must occur within strict, deterministic time constraints (deadlines).
   - Hard Real-Time OS: Missing a deadline causes critical system failure (e.g., flight control systems, airbag deployment).
   - Soft Real-Time OS: Deadlines are desirable but missing one degrades quality without catastrophic failure (e.g., video streaming).
   - Example: VxWorks, QNX, RTLinux.

5. Network Operating System (NOS):
   - Runs on a server and provides networking capabilities such as user account management, shared storage access, domain control, and firewall services across local area networks (LAN).
   - Example: Windows Server, Novell NetWare.

6. Mobile Operating System:
   - Specialized OS tailored for handheld touch devices, incorporating power management, touchscreen gestures, wireless communication, and mobile app sandboxing.
   - Example: Android, Apple iOS.

## Process Scheduling & Deadlocks
- Process States: New, Ready, Running, Waiting, Terminated.
- Scheduling Algorithms: First-Come First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, Round Robin (RR).
- Deadlock Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Deadlock prevention using Banker's Algorithm.
    `,
  },
  {
    subjectCode: "CSE502", // Machine Learning
    fileName: "Machine_Learning_Unit1_Introduction.pdf",
    text: `
# Machine Learning — Course Unit 1: Introduction to ML Paradigms

## What is Machine Learning?
Machine Learning (ML) is a branch of artificial intelligence (AI) focused on building algorithms that learn patterns from data and improve their task performance automatically through experience, without being explicitly programmed.

## Major Types of Machine Learning Algorithms

1. Supervised Learning:
   - The model is trained on a labeled dataset containing input features and ground-truth target outputs.
   - Tasks: Classification (predicting discrete class labels like Spam/Ham) and Regression (predicting continuous numerical values like house prices).
   - Common Algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forests, Support Vector Machines (SVM), K-Nearest Neighbors (KNN).

2. Unsupervised Learning:
   - The model works on unlabeled datasets to discover hidden structures, clusters, or patterns inherent in the data.
   - Tasks: Clustering (grouping similar data points) and Dimensionality Reduction (compressing feature space).
   - Common Algorithms: K-Means Clustering, Hierarchical Clustering, Principal Component Analysis (PCA), t-SNE.

3. Reinforcement Learning (RL):
   - An agent learns optimal action policies by interacting with a dynamic environment to maximize cumulative numerical reward signals through trial and error.
   - Concepts: Agent, State, Action, Reward, Policy, Q-Learning, Deep Q-Networks (DQN).
    `,
  },
  {
    subjectCode: "CSE503", // Cloud Computing
    fileName: "Cloud_Computing_Unit1_Introduction.pdf",
    text: `
# Cloud Computing — Course Unit 1: Cloud Models & Architecture

## What is Cloud Computing?
Cloud Computing is the on-demand delivery of IT resources including compute power, database storage, applications, and networking over the Internet ("the cloud") with pay-as-you-go pricing.

## Cloud Service Models
1. Infrastructure as a Service (IaaS): Provides raw fundamental computing resources such as virtual machines (VMs), storage, and virtual networks (e.g., AWS EC2, Google Compute Engine).
2. Platform as a Service (PaaS): Provides hardware and application software frameworks allowing developers to build, run, and manage applications without managing underlying infrastructure (e.g., AWS Elastic Beanstalk, Heroku).
3. Software as a Service (SaaS): Delivers complete end-user software applications over the web accessible via browsers (e.g., Google Workspace, Microsoft 365, Salesforce).

## Cloud Deployment Models
- Public Cloud: Services offered over the public internet and owned by third-party cloud providers (AWS, Azure, GCP).
- Private Cloud: Infrastructure operated solely for a single organization, hosted on-premises or by a dedicated vendor.
- Hybrid Cloud: Combines public and private clouds, sharing data and applications between them for flexibility and compliance.
    `,
  },
  {
    subjectCode: "CSE601", // Distributed Systems
    fileName: "Distributed_Systems_Unit1_Concepts.pdf",
    text: `
# Distributed Systems — Course Unit 1: Fundamentals & Consensus

## What is a Distributed System?
A Distributed System is a collection of autonomous computing nodes connected by a network that communicate and coordinate actions by passing messages, appearing to end-users as a single coherent system.

## Key Concepts in Distributed Systems
- CAP Theorem: A distributed data store can simultaneously provide at most two out of three guarantees: Consistency (all nodes see the same data at the same time), Availability (every request receives a non-error response), and Partition Tolerance (system operates despite message loss or network partition).
- Consensus Algorithms: Mechanisms for reaching agreement on data values among distributed processes (e.g., Paxos, Raft).
- Fault Tolerance: Ability of a system to continue operating properly in the event of component node failures.
    `,
  },
  {
    subjectCode: "CSE401", // Computer Networks
    fileName: "Computer_Networks_Unit1_Protocols.pdf",
    text: `
# Computer Networks — Course Unit 1: Network Layers & Protocols

## What is a Computer Network?
A Computer Network is a digital telecommunications network allowing nodes to share resources and communicate over wired or wireless channels using standardized communication protocols.

## OSI 7-Layer Reference Model vs TCP/IP
1. Physical Layer: Transmission of raw unstructured bit streams over physical medium (cables, fiber, radio).
2. Data Link Layer: Node-to-node data transfer and framing (Ethernet MAC, Wi-Fi 802.11).
3. Network Layer: Host-to-host routing and IP addressing (IPv4, IPv6, ICMP, OSPF, BGP).
4. Transport Layer: End-to-end communication, segmentation, flow control, and error recovery (TCP, UDP).
5. Application Layer: High-level protocols used by user applications (HTTP, HTTPS, DNS, FTP, SMTP, SSH).
    `,
  },
];

async function seedRagData() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/tutor_db";
  console.log("[RAG Seed] Connecting to MongoDB...");

  try {
    await mongoose.connect(uri);
    console.log("[RAG Seed] Connected to MongoDB.");

    // Find admin or faculty user to assign as uploader
    const uploader = await User.findOne({ role: { $in: ["admin", "faculty"] } });
    if (!uploader) {
      console.error("[RAG Seed] Error: No admin/faculty user found in DB. Run npm run seed first.");
      process.exit(1);
    }

    console.log(`[RAG Seed] Using uploader: ${uploader.name} (${uploader._id})`);

    for (const item of SAMPLE_MATERIALS) {
      // Find or create subject in DB
      let subject = await Subject.findOne({ code: item.subjectCode });
      if (!subject) {
        subject = await Subject.create({
          name: item.fileName.replace(/_/g, " ").replace(".pdf", ""),
          code: item.subjectCode,
          semester: 5,
          facultyId: uploader._id,
        });
        console.log(`[RAG Seed] Created missing Subject: ${item.subjectCode}`);
      }

      // Check if Document record exists, or create one
      let doc = await Document.findOne({ fileName: item.fileName, subjectId: subject._id });
      if (!doc) {
        doc = await Document.create({
          subjectId: subject._id,
          uploaderId: uploader._id,
          fileName: item.fileName,
          fileUrl: `https://res.cloudinary.com/demo/raw/upload/${item.fileName}`,
          cloudinaryPublicId: `seed_${item.fileName}`,
          resourceType: "raw",
          status: "approved",
          ingestionStatus: "pending",
          chunkCount: 0,
          chromaCollection: `subject_${item.subjectCode}`,
        });
      }

      console.log(`[RAG Seed] Ingesting document '${item.fileName}' for ${item.subjectCode} into Python RAG service...`);

      // Call Python RAG service /ingest endpoint
      const response = await fetch(`${RAG_SERVICE_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: String(doc._id),
          subjectCode: item.subjectCode,
          text: item.text,
          metadata: {
            subject: item.subjectCode,
            uploadedAt: new Date().toISOString(),
            fileName: item.fileName,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[RAG Seed] Ingestion failed for ${item.subjectCode}: ${response.status} ${errText}`);
        continue;
      }

      const result = await response.json();
      console.log(`[RAG Seed] ✅ Successfully ingested ${result.chunkCount} chunks into collection '${result.collection}'!`);

      // Update document record in MongoDB
      doc.status = "approved";
      doc.ingestionStatus = "ok";
      doc.chunkCount = result.chunkCount;
      doc.chromaCollection = result.collection;
      await doc.save();
    }

    console.log("\n[RAG Seed Success] 🎉 All sample course materials ingested into ChromaDB and synced to MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("[RAG Seed Error]:", error);
    process.exit(1);
  }
}

seedRagData();
