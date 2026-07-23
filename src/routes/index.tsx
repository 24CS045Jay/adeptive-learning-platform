import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { GraduationCap, User, Users, Shield } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · AI Tutor" },
      { name: "description", content: "Sign in to AI Tutor — grounded academic tutoring for CSPIT CSE." },
      { property: "og:title", content: "Sign in · AI Tutor" },
      { property: "og:description", content: "Sign in to AI Tutor — grounded academic tutoring for CSPIT CSE." },
    ],
  }),
  component: Index,
});

function Index() {
  const roles = [
    { to: "/student", label: "Student", desc: "Ask, learn, quiz yourself.", icon: User, color: "text-indigo-brand bg-indigo-brand/10" },
    { to: "/faculty", label: "Faculty", desc: "Manage content and answer queries.", icon: Users, color: "text-amber-brand bg-amber-brand/15" },
    { to: "/admin", label: "Admin", desc: "Operate the institution knowledge base.", icon: Shield, color: "text-teal-brand bg-teal-brand/10" },
  ] as const;
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 font-sans">
      <div className="w-full max-w-3xl">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy">
            <GraduationCap className="h-6 w-6 text-amber-brand" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-3xl font-bold text-navy">AI Tutor</div>
            <div className="text-xs text-slate-500">CSPIT CSE · RAG Platform</div>
          </div>
        </div>
        <h1 className="text-center font-serif text-4xl font-bold text-slate-900">Sign in to continue</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Choose your role to enter the workspace. Answers are grounded in your faculty's approved course material.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="group rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(30,27,60,0.08)] transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${r.color}`}>
                <r.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-serif text-xl font-bold text-slate-900">{r.label}</div>
              <div className="mt-1 text-sm text-slate-500">{r.desc}</div>
              <div className="mt-4 text-sm font-medium text-indigo-brand group-hover:underline">Enter →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
