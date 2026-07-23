import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Upload, FileText, MessagesSquare, BarChart3, ListChecks, AlertTriangle, Megaphone } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/faculty", label: "Dashboard", icon: LayoutDashboard },
  { to: "/faculty/upload", label: "Upload Content", icon: Upload },
  { to: "/faculty/documents", label: "My Documents", icon: FileText },
  { to: "/faculty/queries", label: "Student Queries", icon: MessagesSquare },
  { to: "/faculty/analytics", label: "Class Analytics", icon: BarChart3 },
  { to: "/faculty/quizzes", label: "Quiz Manager", icon: ListChecks },
  { to: "/faculty/escalations", label: "Escalations", icon: AlertTriangle },
  { to: "/faculty/announcements", label: "Announcements", icon: Megaphone },
];

export const Route = createFileRoute("/faculty")({
  head: () => ({ meta: [{ title: "Faculty · AI Tutor" }, { name: "description", content: "Faculty workspace for AI Tutor — manage subjects, content, and queries." }] }),
  component: () => <AppShell role="faculty" nav={nav} />,
});
