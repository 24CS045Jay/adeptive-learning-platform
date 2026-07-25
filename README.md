# AI Tutor Platform (CSPIT CSE Adaptive Learning Platform)

An AI-powered adaptive learning and RAG tutoring platform for CSPIT Computer Engineering, featuring role-based dashboards (Student, Faculty, Admin), MongoDB Atlas data layer, Cloudinary raw file storage, and grounded vector QA.

---

## 🚀 Quick Setup & Installation Guide

Follow these steps to set up and run the platform locally:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your real connection keys:

```bash
cp .env.example .env
```

Set the required environment variables inside `.env`:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_tutor?retryWrites=true&w=majority

# JWT secret key
JWT_SECRET=ai_tutor_super_secret_jwt_key_2026

# Cloudinary cloud configuration for PDF/PPTX/DOCX documents
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Models & Vector Database
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CHROMA_URL=http://localhost:8000
```

### 3. Seed MongoDB Atlas Database

Populate your MongoDB database with initial accounts (1 Admin, 3 Faculty, 3 Students) and 6 CSE courses (CSE501 - CSE506):

```bash
node scripts/seed.js
```

*(Note: The seed script is idempotent and safe to run multiple times without duplicating data.)*

### 4. Run Development Servers

Run the Vite frontend & TanStack application:

```bash
npm run dev
```

Run the Express + MongoDB backend server (optional standalone port 5000):

```bash
npm run server
```

---

## 📦 Database Schemas (MongoDB Atlas via Mongoose)

- **User**: Name, email, passwordHash, role (`admin` | `faculty` | `student`), timestamps.
- **Subject**: Name, code (e.g., `CSE501`), semester, facultyId (ref `User`).
- **Document**: subjectId (ref `Subject`), uploaderId (ref `User`), fileName, fileUrl, cloudinaryPublicId, resourceType (`raw`), status (`pending` | `approved` | `rejected`), chunkCount, chromaCollection, timestamps.
- **Quiz**: subjectId (ref `Subject`), title, createdBy (ref `User`), isAiGenerated, timestamps.
- **Question**: quizId (ref `Quiz`), text, options, correctOption, topicTag, difficulty (`easy` | `medium` | `hard`).
- **Attempt**: quizId (ref `Quiz`), studentId (ref `User`), score, answers, submittedAt.
- **TopicMastery**: studentId (ref `User`), subjectId (ref `Subject`), topicTag, masteryLabel (`weak` | `average` | `strong`), updatedAt.
- **Announcement**: Title, message, scope (`institution` | `subject`), authorId (ref `User`), timestamps.
- **AuditLog**: actorId (ref `User`), action, details, timestamps.
- **Escalation**: studentId (ref `User`), subjectId (ref `Subject`), question, status (`open` | `resolved`), resolvedBy (ref `User`).

---

## 🛠 File Upload & Storage (Cloudinary Integration)

- **Upload Endpoint**: `POST /api/documents/upload` (Faculty only)
  - Accepts multipart uploads (`.pdf`, `.pptx`, `.docx`). Rejects invalid file formats with a `400` error.
  - Uploads raw document files into subject-specific Cloudinary folders (`subjects/CSE501/`).
  - Creates a `pending` Document record in MongoDB storing `fileUrl` and `cloudinaryPublicId`.
- **Approval Endpoints**: `PATCH /api/documents/:id/approve` and `/reject` (Admin only).
  - Log all upload, approve, and reject actions to `AuditLog`.
- **Atomic Deletion**: `DELETE /api/documents/:id` (Admin only).
  - Simultaneously removes raw document files from Cloudinary using `cloudinaryPublicId` and deletes the MongoDB document record.

---

## 🔑 Demo Login Credentials

- **Student**: `student@charusat.edu.in` / `password123`
- **Faculty**: `faculty@charusat.edu.in` / `password123`
- **Admin**: `admin@charusat.edu.in` / `password123`
