import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Users,
  GripVertical, Link2, FileText, Presentation, FileType2,
  X, Check, Edit3, Save, CheckCircle2,
} from "lucide-react";
import { PageHeader, Card, PrimaryButton, Pill, EmptyState } from "@/components/app-shell";
import { useAppData } from "@/lib/app-data-context";
import type { LearningModule, LearningResource, ResourceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/subjects")({
  component: SubjectsPage,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RESOURCE_ICONS: Record<ResourceType, React.ElementType> = {
  pdf:   FileText,
  pptx:  Presentation,
  docx:  FileType2,
  link:  Link2,
  video: BookOpen,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  pdf:   "bg-red-brand/10 text-red-brand",
  pptx:  "bg-amber-brand/15 text-amber-700",
  docx:  "bg-indigo-brand/10 text-indigo-brand",
  link:  "bg-teal-brand/10 text-teal-brand",
  video: "bg-green-brand/10 text-green-brand",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function SubjectsPage() {
  const {
    subjects: subjectList, modules, resources, users,
    addSubject, deleteSubject, updateSyllabus,
    addModule, removeModule, addResource, removeResource,
    enrollStudent, unenrollStudent,
  } = useAppData();

  const studentUsers = users.filter((u) => u.role === "Student");
  const facultyUsers = users.filter((u) => u.role === "Faculty");

  // Modal / Form state for Add Subject
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName]         = useState("");
  const [newSubjCode, setNewSubjCode]         = useState("");
  const [newSubjSem, setNewSubjSem]           = useState("5");
  const [newSubjFaculty, setNewSubjFaculty]   = useState(facultyUsers[0]?.name ?? "Dr. Nisha Shah");
  const [newSubjSyllabus, setNewSubjSyllabus] = useState("");
  const [subjAddedBanner, setSubjAddedBanner] = useState(false);

  // Expanded card state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<Record<string, "syllabus" | "modules" | "resources" | "students">>({});

  // Module / Resource form states
  const [newModuleName, setNewModuleName] = useState<Record<string, string>>({});
  const [newRes, setNewRes] = useState<{ moduleId: string | null; name: string; type: ResourceType; url: string }>({
    moduleId: null, name: "", type: "link", url: "",
  });
  const [editingSyllabusId, setEditingSyllabusId] = useState<string | null>(null);
  const [syllabusEdit, setSyllabusEdit] = useState("");

  const getTab = (sid: string) => activeTab[sid] ?? "syllabus";

  const subjectModules = (sid: string) =>
    modules.filter((m) => m.subjectId === sid).sort((a, b) => a.order - b.order);

  const moduleResources = (mid: string) =>
    resources.filter((r) => r.moduleId === mid);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim()) return;

    addSubject({
      name: newSubjName.trim(),
      code: newSubjCode.trim().toUpperCase(),
      semester: parseInt(newSubjSem, 10),
      faculty: newSubjFaculty,
      syllabus: newSubjSyllabus.trim(),
    });

    setNewSubjName("");
    setNewSubjCode("");
    setNewSubjSyllabus("");
    setShowAddSubjectModal(false);
    setSubjAddedBanner(true);
    setTimeout(() => setSubjAddedBanner(false), 3500);
  };

  const handleAddModule = (sid: string) => {
    const name = newModuleName[sid]?.trim();
    if (!name) return;
    const existing = subjectModules(sid);
    addModule({ subjectId: sid, order: existing.length + 1, name });
    setNewModuleName((prev) => ({ ...prev, [sid]: "" }));
  };

  const handleAddResource = () => {
    if (!newRes.moduleId || !newRes.name.trim()) return;
    addResource({ moduleId: newRes.moduleId, name: newRes.name.trim(), type: newRes.type, url: newRes.url || undefined });
    setNewRes({ moduleId: null, name: "", type: "link", url: "" });
  };

  const saveSyllabus = (sid: string) => {
    updateSyllabus(sid, syllabusEdit);
    setEditingSyllabusId(null);
  };

  return (
    <div>
      <PageHeader
        title="Courses & Subjects"
        subtitle={`Manage ${subjectList.length} semester subjects, modules, learning resources, and student enrolment.`}
        action={
          <PrimaryButton icon={Plus} onClick={() => setShowAddSubjectModal(true)}>
            Add Subject
          </PrimaryButton>
        }
      />

      {subjAddedBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Subject added successfully! It is now live for faculty and students.
        </div>
      )}

      {/* ── Add Subject Modal ── */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
                <BookOpen className="h-5 w-5 text-indigo-brand" /> Add New Subject
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newSubjName}
                    onChange={(e) => setNewSubjName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={newSubjCode}
                    onChange={(e) => setNewSubjCode(e.target.value)}
                    placeholder="CSE504"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-indigo-brand"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Semester
                  </label>
                  <select
                    value={newSubjSem}
                    onChange={(e) => setNewSubjSem(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>Semester {n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Assigned Faculty
                  </label>
                  <select
                    value={newSubjFaculty}
                    onChange={(e) => setNewSubjFaculty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand"
                  >
                    {facultyUsers.length > 0 ? (
                      facultyUsers.map((f) => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))
                    ) : (
                      <option value="Dr. Nisha Shah">Dr. Nisha Shah</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Course Syllabus / Description
                </label>
                <textarea
                  value={newSubjSyllabus}
                  onChange={(e) => setNewSubjSyllabus(e.target.value)}
                  placeholder="Overview of topics, learning objectives, and prerequisites..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-brand px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-brand-hover shadow-sm"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Subjects List ── */}
      <div className="space-y-4">
        {subjectList.map((s) => {
          const isOpen = expandedId === s.id;
          const tab = getTab(s.id);
          const mods = subjectModules(s.id);
          const enrolled = studentUsers.filter((u) => s.enrolledStudentIds.includes(u.id));

          return (
            <div
              key={s.id}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)]"
            >
              {/* Header row */}
              <div
                onClick={() => setExpandedId(isOpen ? null : s.id)}
                className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-brand/10">
                    <BookOpen className="h-5 w-5 text-indigo-brand" />
                  </div>
                  <div>
                    <div className="font-serif text-lg font-bold text-slate-900">{s.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {s.code} · Sem {s.semester} · {s.faculty} · {mods.length} modules · {enrolled.length} students
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete subject "${s.name}"?`)) {
                        deleteSubject(s.id);
                      }
                    }}
                    className="text-slate-300 hover:text-red-brand transition"
                    title="Delete subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded panel */}
              {isOpen && (
                <div className="border-t border-slate-100">
                  {/* Tab bar */}
                  <div className="flex border-b border-slate-100 px-6">
                    {(["syllabus", "modules", "resources", "students"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveTab((prev) => ({ ...prev, [s.id]: t }))}
                        className={cn(
                          "border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors",
                          tab === t
                            ? "border-indigo-brand text-indigo-brand font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="px-6 py-5">
                    {/* ── Syllabus tab ── */}
                    {tab === "syllabus" && (
                      <div>
                        {editingSyllabusId === s.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={syllabusEdit}
                              onChange={(e) => setSyllabusEdit(e.target.value)}
                              rows={6}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-brand"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveSyllabus(s.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-brand px-4 py-2 text-sm font-medium text-white hover:bg-indigo-brand-hover"
                              >
                                <Save className="h-4 w-4" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSyllabusId(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm leading-relaxed text-slate-600">
                              {s.syllabus || <span className="italic text-slate-400">No syllabus added yet.</span>}
                            </p>
                            <button
                              type="button"
                              onClick={() => { setEditingSyllabusId(s.id); setSyllabusEdit(s.syllabus ?? ""); }}
                              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-brand hover:underline"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit syllabus
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Modules tab ── */}
                    {tab === "modules" && (
                      <div className="space-y-3">
                        {mods.length === 0 && (
                          <EmptyState icon={BookOpen} title="No modules yet" description="Add the first learning module below." />
                        )}
                        {mods.map((mod) => (
                          <div key={mod.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-brand/10 text-xs font-bold text-indigo-brand">
                              {mod.order}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900">{mod.name}</div>
                              {mod.description && <div className="text-xs text-slate-400 truncate">{mod.description}</div>}
                            </div>
                            <button type="button" onClick={() => removeModule(mod.id)} className="text-slate-300 hover:text-red-brand">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-2">
                          <input
                            value={newModuleName[s.id] ?? ""}
                            onChange={(e) => setNewModuleName((prev) => ({ ...prev, [s.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleAddModule(s.id)}
                            placeholder="New module name, e.g. Unit 5 – Advanced Topics"
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-brand"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddModule(s.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-brand px-4 py-2 text-sm font-medium text-white hover:bg-indigo-brand-hover"
                          >
                            <Plus className="h-4 w-4" /> Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Resources tab ── */}
                    {tab === "resources" && (
                      <div className="space-y-4">
                        {mods.length === 0 && (
                          <EmptyState icon={Link2} title="No modules" description="Add modules first, then attach resources to them." />
                        )}
                        {mods.map((mod) => {
                          const res = moduleResources(mod.id);
                          return (
                            <div key={mod.id}>
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{mod.name}</div>
                              {res.length === 0 ? (
                                <div className="text-xs text-slate-400 italic pl-1 mb-2">No resources yet.</div>
                              ) : (
                                <div className="space-y-1.5 mb-2">
                                  {res.map((r) => {
                                    const Icon = RESOURCE_ICONS[r.type];
                                    return (
                                      <div key={r.id} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs", RESOURCE_COLORS[r.type])}>
                                          <Icon className="h-3.5 w-3.5" />
                                        </span>
                                        <span className="flex-1 text-sm text-slate-700 truncate">{r.name}</span>
                                        {r.url && (
                                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-brand hover:underline">open</a>
                                        )}
                                        <button type="button" onClick={() => removeResource(r.id)} className="text-slate-300 hover:text-red-brand">
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {newRes.moduleId === mod.id ? (
                                <div className="rounded-xl border border-indigo-brand/20 bg-indigo-brand/5 p-3 space-y-2">
                                  <input
                                    value={newRes.name}
                                    onChange={(e) => setNewRes((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Resource name"
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none"
                                  />
                                  <div className="flex gap-2">
                                    <select
                                      value={newRes.type}
                                      onChange={(e) => setNewRes((p) => ({ ...p, type: e.target.value as ResourceType }))}
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                                    >
                                      <option value="link">Link</option>
                                      <option value="pdf">PDF</option>
                                      <option value="pptx">PPTX</option>
                                      <option value="docx">DOCX</option>
                                      <option value="video">Video</option>
                                    </select>
                                    <input
                                      value={newRes.url}
                                      onChange={(e) => setNewRes((p) => ({ ...p, url: e.target.value }))}
                                      placeholder="URL (optional)"
                                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="button" onClick={handleAddResource} className="flex items-center gap-1 rounded-lg bg-indigo-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-brand-hover">
                                      <Check className="h-3.5 w-3.5" /> Add
                                    </button>
                                    <button type="button" onClick={() => setNewRes({ moduleId: null, name: "", type: "link", url: "" })} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setNewRes((p) => ({ ...p, moduleId: mod.id }))}
                                  className="flex items-center gap-1 text-xs text-indigo-brand hover:underline"
                                >
                                  <Plus className="h-3.5 w-3.5" /> Add resource
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Students tab ── */}
                    {tab === "students" && (
                      <div className="space-y-2">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm text-slate-500">{enrolled.length} student{enrolled.length !== 1 ? "s" : ""} enrolled</span>
                        </div>
                        {studentUsers.map((u) => {
                          const isEnrolled = s.enrolledStudentIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              className={cn(
                                "flex items-center justify-between rounded-xl border px-4 py-3 transition",
                                isEnrolled ? "border-indigo-brand/20 bg-indigo-brand/5" : "border-slate-100 bg-slate-50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-brand/10 text-xs font-bold text-indigo-brand">
                                  {u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{u.name}</div>
                                  <div className="text-xs text-slate-400">{u.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isEnrolled && <Pill tone="indigo">Enrolled</Pill>}
                                <button
                                  type="button"
                                  onClick={() => s.enrolledStudentIds.includes(u.id) ? unenrollStudent(s.id, u.id) : enrollStudent(s.id, u.id)}
                                  className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                                    isEnrolled
                                      ? "border border-red-200 text-red-600 hover:bg-red-50"
                                      : "border border-indigo-brand/30 text-indigo-brand hover:bg-indigo-brand/10"
                                  )}
                                >
                                  {isEnrolled ? "Remove" : "Enrol"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
