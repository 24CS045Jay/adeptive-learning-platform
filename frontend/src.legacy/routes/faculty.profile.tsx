import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/profile-page";

export const Route = createFileRoute("/faculty/profile")({
  head: () => ({ meta: [{ title: "Profile · AI Tutor" }] }),
  component: () => <ProfilePage role="faculty" />,
});
