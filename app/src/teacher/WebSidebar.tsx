import { WorkspaceSidebar, type WorkspaceSidebarItem } from "../WorkspaceSidebar";
import { primaryTab, type Route } from "./model";
import { useWorkspace } from "./context";
import type { Navigate } from "./components";

export function WebSidebar({ route, navigate }: { route: Route; navigate: Navigate }) {
  const { profile } = useWorkspace();
  const tab = route.tab || "Library";
  const item = (id: string, label: string, icon: string, next: Route, active = false): WorkspaceSidebarItem => ({
    id, label, icon, active, onSelect: () => navigate(next, true),
  });
  const modulePages = ["modules", "results", "submission", "feedback-preview"];
  const lessonPages = ["editor", "lesson-preview", "ai-review", "share"];
  return (
    <WorkspaceSidebar
      workspaceLabel="Teaching workspace"
      homeHref="/?teacher=1&view=web"
      primaryAction={item("new-lesson", "New lesson", "plus", { page: "lessons", tab: "Module editor" })}
      groups={[
        { items: [
          item("students", "Students", "students", { page: "students" }, ["students", "student"].includes(route.page)),
          item("schedule", "Schedule", "calendar", { page: "schedule" }, primaryTab(route) === "schedule" && route.page !== "availability"),
          item("lessons", "Lessons", "book", { page: "lessons", tab: "Library" }, lessonPages.includes(route.page) || (route.page === "lessons" && !["Templates", "Archive"].includes(tab))),
          item("messages", "Messages", "message", { page: "messages" }, route.page === "messages"),
        ] },
        { label: "Teaching tools", items: [
          item("modules", "Ongoing modules", "layers", { page: "modules" }, modulePages.includes(route.page)),
          item("availability", "Availability", "clock", { page: "availability" }, route.page === "availability"),
          item("templates", "Templates", "document", { page: "lessons", tab: "Templates" }, route.page === "lessons" && tab === "Templates"),
          item("archive", "Archive", "archive", { page: "lessons", tab: "Archive" }, route.page === "lessons" && tab === "Archive"),
        ] },
      ]}
      supportLinks={[
        item("help", "Help & support", "help", { page: "help" }, route.page === "help"),
        { id: "mobile", label: "Mobile app", icon: "video", href: "/?teacher=1&view=mobile" },
      ]}
      account={{
        name: profile.name,
        role: "Teacher account",
        portraitId: profile.name === "Gilbert" ? "gilbert" : undefined,
        initials: profile.name.slice(0, 1).toUpperCase(),
        ariaLabel: "Teacher account menu",
        items: [
          item("profile", "Teaching profile", "person", { page: "profile" }, ["profile", "profile-edit", "profile-preview", "identity"].includes(route.page)),
          item("settings", "Account settings", "settings", { page: "settings" }, route.page === "settings"),
          item("payout", "Payout", "wallet", { page: "payout" }, route.page === "payout"),
          { id: "replay", label: "Replay onboarding", icon: "back", href: "/?view=web", separatorBefore: true },
        ],
      }}
    />
  );
}
