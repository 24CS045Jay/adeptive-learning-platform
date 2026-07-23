import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Users, BookOpen, CheckSquare, Database, BarChart3, ScrollText, Megaphone, FileBarChart } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subjects", label: "Courses & Subjects", icon: BookOpen },
  { to: "/admin/approvals", label: "Content Approval", icon: CheckSquare },
  { to: "/admin/knowledge", label: "Knowledge Base", icon: Database },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
];

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · AI Tutor" }, { name: "description", content: "Institution admin console for AI Tutor." }] }),
  component: () => <AppShell role="admin" nav={nav} />,
});
