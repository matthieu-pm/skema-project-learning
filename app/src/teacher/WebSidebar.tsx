import { useState } from "react";
import { primaryTab, type Route } from "./model";
import { useWorkspace } from "./context";
import { Icon } from "./icons";
import type { Navigate } from "./components";
import ProfilePortrait from "../ProfilePortrait";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "./ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Section = {
  page: string;
  label: string;
  icon: string;
  items?: { label: string; route: Route }[];
};
const sections: Section[] = [
  {
    page: "students",
    label: "Students",
    icon: "students",
    items: [
      { label: "Student profiles", route: { page: "students" } },
      { label: "Ongoing modules", route: { page: "modules" } },
    ],
  },
  { page: "schedule", label: "Schedule", icon: "calendar" },
  { page: "availability", label: "Availability", icon: "clock" },
  {
    page: "lessons",
    label: "Lessons",
    icon: "book",
    items: [
      { label: "Library", route: { page: "lessons", tab: "Library" } },
      {
        label: "Module editor",
        route: { page: "lessons", tab: "Module editor" },
      },
      { label: "Templates", route: { page: "lessons", tab: "Templates" } },
      { label: "Archive", route: { page: "lessons", tab: "Archive" } },
    ],
  },
  { page: "messages", label: "Messages", icon: "message" },
];

export function WebSidebar({
  route,
  navigate,
}: {
  route: Route;
  navigate: Navigate;
}) {
  const { profile } = useWorkspace();
  const { isMobile, setOpenMobile } = useSidebar();
  const [expanded, setExpanded] = useState<string[]>([primaryTab(route)]);
  const go = (next: Route) => {
    navigate(next, true);
    if (isMobile) setOpenMobile(false);
  };
  const isActive = (page: string) => {
    if (["availability", "messages"].includes(route.page))
      return route.page === page;
    return primaryTab(route) === page;
  };
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className={`tw-shadcn-sidebar tw-cal-sidebar${route.page === "editor" ? " tw-editor-sidebar" : ""}`}
    >
      <SidebarHeader>
        <div className="tw-sidebar-header-row">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    aria-label="Account menu"
                    tooltip={profile.name}
                    className="tw-sidebar-account"
                  >
                    <span className="tw-teacher-avatar">
                      {profile.name === "Gilbert" ? (
                        <ProfilePortrait id="gilbert" initials="G" />
                      ) : (
                        profile.name.slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <span className="tw-account-copy">
                      <strong>{profile.name}</strong>
                    </span>
                    <Icon
                      name="down"
                      className="tw-account-chevron"
                      size={15}
                    />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="tw-account-menu w-60"
                  side="bottom"
                  align="start"
                  sideOffset={6}
                >
                  <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => go({ page: "profile" })}>
                    <Icon name="person" />
                    Teaching profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => go({ page: "settings" })}>
                    <Icon name="settings" />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => go({ page: "payout" })}>
                    <Icon name="wallet" />
                    Payout
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/?view=web">
                      <Icon name="back" />
                      Replay onboarding
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          {isMobile && (
            <button
              className="tw-sidebar-close"
              aria-label="Close navigation"
              onClick={() => setOpenMobile(false)}
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="tw-sidebar-group-label">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu>
            {sections.map((section) => (
              <Collapsible
                key={section.page}
                asChild
                open={expanded.includes(section.page)}
                onOpenChange={(open) =>
                  setExpanded((values) =>
                    open
                      ? [...values, section.page]
                      : values.filter((value) => value !== section.page),
                  )
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={section.label}
                    isActive={isActive(section.page)}
                    aria-current={isActive(section.page) ? "page" : undefined}
                    aria-label={section.label}
                    onClick={() => {
                      if (section.items)
                        setExpanded((values) =>
                          values.includes(section.page)
                            ? values
                            : [...values, section.page],
                        );
                      go({ page: section.page });
                    }}
                  >
                    <Icon name={section.icon} />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                  {section.items && (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction
                          className="data-[state=open]:rotate-90"
                          aria-label={`Expand ${section.label}`}
                        >
                          <Icon name="arrow" size={14} />
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => (
                            <SidebarMenuSubItem key={item.label}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={
                                  route.page === item.route.page &&
                                  (!item.route.tab ||
                                    item.route.tab === (route.tab || "Library"))
                                }
                              >
                                <button onClick={() => go(item.route)}>
                                  {item.label}
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto tw-sidebar-utilities">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Profile"
                isActive={
                  route.page === "profile" ||
                  route.page === "profile-edit" ||
                  route.page === "profile-preview"
                }
                onClick={() => go({ page: "profile" })}
              >
                <Icon name="person" />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Help & support"
                onClick={() => go({ page: "help" })}
              >
                <Icon name="help" />
                <span>Help & support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Mobile app" asChild>
                <a href="/?teacher=1&view=mobile">
                  <Icon name="video" />
                  <span>Mobile app</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={route.page === "settings"}
              onClick={() => go({ page: "settings" })}
            >
              <Icon name="settings" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
