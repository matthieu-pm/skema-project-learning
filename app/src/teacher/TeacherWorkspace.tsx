import { useEffect, useState } from "react";
import {
  FlowStack,
  MobileScroll,
  useKeyboard,
  useKeyboardInsets,
  type FlowScreen,
} from "../mobile";
import type { Answers } from "../onboarding";
import { uid, primaryTab, type Route } from "./model";
import { Workspace, useWorkspace, useWorkspaceState } from "./context";
import { Icon, Button, type Navigate } from "./components";
import { TeacherPage } from "./pages";
import "./shadcn.css";
import "./teacher.css";
import "./uxcel.css";
import "./onboarding-blend.css";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { WebSidebar } from "./WebSidebar";
const tabs = [
  ["students", "Students", "students"],
  ["schedule", "Schedule", "calendar"],
  ["lessons", "Lessons", "book"],
  ["profile", "Profile", "person"],
] as const;
function Navigation({ route, navigate }: { route: Route; navigate: Navigate }) {
  const selected = route.page === "students" ? "students" : primaryTab(route);
  return (
    <nav className="tw-navigation" aria-label="Teacher workspace">
      {tabs.map(([page, label, icon]) => (
        <button
          key={page}
          aria-current={selected === page ? "page" : undefined}
          onClick={() => navigate({ page }, true)}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
const titles: Record<string, string> = {
  students: "Students",
  student: "Student profile",
  modules: "Ongoing modules",
  results: "Module results",
  messages: "Messages",
  submission: "Review submission",
  "feedback-preview": "Review feedback",
  schedule: "Schedule",
  session: "Session details",
  availability: "Availability",
  reschedule: "Change time",
  cancel: "Cancel session",
  issue: "Session issue",
  lobby: "Session lobby",
  live: "Online lesson",
  recap: "Lesson recap",
  "recap-preview": "Review recap",
  lessons: "Lessons",
  editor: "Module editor",
  "lesson-preview": "Learner preview",
  "ai-review": "Review AI draft",
  share: "Share lesson",
  profile: "Profile",
  "profile-edit": "Edit profile",
  "profile-preview": "Teaching profile",
  settings: "Account settings",
  help: "Help",
  payout: "Payout",
  identity: "Identity preview",
};
function Toolbar({
  route,
  navigate,
  back,
  canGoBack,
}: {
  route: Route;
  navigate: Navigate;
  back: () => void;
  canGoBack: boolean;
}) {
  const { profile, mobile } = useWorkspace();
  return (
    <header className="tw-toolbar">
      <div className="tw-toolbar-left">
        {!mobile && <SidebarTrigger />}
        {canGoBack && (
          <button
            className="tw-icon-button"
            aria-label="Go back"
            onClick={back}
          >
            <Icon name="back" />
          </button>
        )}
        <span>
          {mobile ? (
            titles[route.page]
          ) : (
            <>
              Teaching workspace{" "}
              <span className="tw-breadcrumb">/ {titles[route.page]}</span>
            </>
          )}
        </span>
      </div>
      <div className="tw-toolbar-right">
        {!mobile && (
          <a className="tw-device-link" href="/?teacher=1">
            Mobile app <Icon name="arrow" size={16} />
          </a>
        )}
        <button
          className="tw-icon-button"
          aria-label="Open messages"
          onClick={() => navigate({ page: "messages" })}
        >
          <Icon name="message" />
          <i />
        </button>
        {!mobile && (
          <span className="tw-teacher-avatar">
            {profile.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
    </header>
  );
}
function Notice() {
  const { notice, setNotice, mobile } = useWorkspace();
  const { bottomInset } = useKeyboardInsets();
  useEffect(() => {
    if (!notice || notice.startsWith("Connection unavailable")) return;
    const timeout = window.setTimeout(() => setNotice(""), 5500);
    return () => window.clearTimeout(timeout);
  }, [notice, setNotice]);
  return notice ? (
    <div
      className="tw-notice"
      role="status"
      style={mobile ? { bottom: bottomInset + 78 } : undefined}
    >
      <span>{notice}</span>
      <button aria-label="Dismiss notification" onClick={() => setNotice("")}>
        <Icon name="close" size={16} />
      </button>
    </div>
  ) : null;
}
function screenFor(route: Route): FlowScreen {
  const screenId = uid();
  return {
    id: screenId,
    headerHeight: 60,
    header: (flow) => (
      <Toolbar
        route={route}
        navigate={(r, replace) =>
          replace ? flow.replace(screenFor(r)) : flow.push(screenFor(r))
        }
        back={flow.pop}
        canGoBack={flow.canGoBack}
      />
    ),
    footerHeight: 70,
    footer: () => <MobileTabNavigation route={route} />,
    render: (flow) => (
      <MobileScroll className="tw-mobile-scroll">
        <main
          className="tw-content"
          inert={flow.current.id !== screenId}
          aria-hidden={flow.current.id !== screenId}
        >
          <TeacherPage
            route={route}
            navigate={(r, replace) =>
              replace ? flow.replace(screenFor(r)) : flow.push(screenFor(r))
            }
            back={flow.pop}
          />
        </main>
      </MobileScroll>
    ),
  };
}
function MobileTabNavigation({ route }: { route: Route }) {
  const { setMobileRoot } = useWorkspace();
  return <Navigation route={route} navigate={(r) => setMobileRoot(r)} />;
}
export default function TeacherWorkspace({
  mobile = false,
  answers,
}: {
  mobile?: boolean;
  answers?: Answers;
}) {
  const [mobileRoot, setMobileRootState] = useState({
    route: { page: "students" } as Route,
    key: 0,
  });
  const setMobileRoot = (route: Route) => {
    keyboard.hide();
    setMobileRootState((v) => ({ route, key: v.key + 1 }));
  };
  const state = useWorkspaceState(answers);
  const [route, setRoute] = useState<Route>({ page: "students" }),
    [history, setHistory] = useState<Route[]>([]);
  const keyboard = useKeyboard();
  const navigate: Navigate = (r, replace = false) => {
    keyboard.hide();
    if (!replace) setHistory((h) => [...h, route]);
    else setHistory([]);
    setRoute(r);
  };
  const back = () => {
    keyboard.hide();
    setRoute(history.at(-1) || { page: primaryTab(route) });
    setHistory((h) => h.slice(0, -1));
  };
  useEffect(() => {
    document.title = mobile
      ? "Mimo · Teacher mobile"
      : "Mimo · Teaching workspace";
  }, [mobile]);
  return (
    <Workspace.Provider value={{ ...state, mobile, setMobileRoot }}>
      <div
        className={`teacher-workspace ${mobile ? "teacher-mobile" : "teacher-web"}`}
      >
        {mobile ? (
          <FlowStack
            key={mobileRoot.key}
            initial={screenFor(mobileRoot.route)}
          />
        ) : (
          <SidebarProvider className="tw-web-shell">
            <WebSidebar route={route} navigate={navigate} />
            <SidebarInset className="tw-web-main">
              <Toolbar
                route={route}
                navigate={navigate}
                back={back}
                canGoBack={history.length > 0}
              />
              <div key={JSON.stringify(route)} className="tw-content">
                <TeacherPage route={route} navigate={navigate} back={back} />
              </div>
            </SidebarInset>
          </SidebarProvider>
        )}
        <Notice />
      </div>
    </Workspace.Provider>
  );
}
