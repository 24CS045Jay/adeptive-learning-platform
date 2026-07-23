import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, MessageCircle, Search, ListChecks, Bookmark, CalendarClock, Megaphone } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/ask", label: "Ask Tutor", icon: MessageCircle },
  { to: "/student/search", label: "Search Notes", icon: Search },
  { to: "/student/quizzes", label: "Quizzes", icon: ListChecks },
  { to: "/student/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/student/planner", label: "Study Planner", icon: CalendarClock },
  { to: "/student/announcements", label: "Announcements", icon: Megaphone },
];

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student · AI Tutor" }, { name: "description", content: "Student learning dashboard for AI Tutor." }] }),
  component: () => <AppShell role="student" nav={nav} />,
});
