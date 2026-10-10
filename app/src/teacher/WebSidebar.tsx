import { useState } from "react";
import { primaryTab, type Route } from "./model";
import { useWorkspace } from "./context";
import { Icon } from "./icons";
import type { Navigate } from "./components";
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

const sections = [
  {
    page: "students",
    label: "Students",
    icon: "students",
    items: [
      { label: "Student profiles", route: { page: "students" } },
      { label: "Ongoing modules", route: { page: "modules" } },
      { label: "Messages", route: { page: "messages" } },
    ],
  },
  {
    page: "schedule",
    label: "Schedule",
    icon: "calendar",
    items: [
      { label: "Calendar", route: { page: "schedule" } },
      { label: "Availability", route: { page: "availability" } },
    ],
  },
  {
    page: "lessons",
    label: "Lessons",
    icon: "book",
    items: [
      {
        label: "Module editor",
        route: { page: "lessons", tab: "Module editor" },
      },
      { label: "Library", route: { page: "lessons", tab: "Library" } },
      { label: "Templates", route: { page: "lessons", tab: "Templates" } },
      { label: "Archive", route: { page: "lessons", tab: "Archive" } },
    ],
  },
  {
    page: "profile",
    label: "Profile",
    icon: "person",
    items: [
      { label: "Teaching profile", route: { page: "profile" } },
      { label: "Help", route: { page: "help" } },
      { label: "Account settings", route: { page: "settings" } },
      { label: "Payout", route: { page: "payout" } },
    ],
  },
] as const;

// sidebar-08: inset shell, collapsible main groups, secondary links, account menu.
export function WebSidebar({
  route,
  navigate,
}: {
  route: Route;
  navigate: Navigate;
}) {
  const { profile } = useWorkspace();
  const { isMobile, setOpenMobile } = useSidebar();
  const [expanded, setExpanded] = useState<string[]>(["students"]);
  const go = (next: Route) => {
    navigate(next, true);
    if (isMobile) setOpenMobile(false);
  };
  return (
    <Sidebar variant="inset" collapsible="icon" className="tw-shadcn-sidebar">
      <SidebarHeader>
        {isMobile && (
          <button
            className="tw-sidebar-close"
            aria-label="Close navigation"
            onClick={() => setOpenMobile(false)}
          >
            <Icon name="close" />
          </button>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/?teacher=1&view=web" className="tw-sidebar-brand">
                <span className="tw-brand-tile">
                  <img src="/assets/onboarding/luma.png" alt="" />
                </span>
                <span className="tw-brand-name">
                  <strong>mimo</strong>
                  <span>Teaching workspace</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Teaching</SidebarGroupLabel>
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
                      : values.filter((v) => v !== section.page),
                  )
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={section.label}
                    isActive={primaryTab(route) === section.page}
                    aria-current={
                      primaryTab(route) === section.page ? "page" : undefined
                    }
                    aria-label={section.label}
                    onClick={() => go({ page: section.page })}
                  >
                    <Icon name={section.icon} />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className="data-[state=open]:rotate-90"
                      aria-label={`Expand ${section.label}`}
                    >
                      <Icon name="arrow" size={16} />
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
                              (("tab" in item.route &&
                                item.route.tab === (route.tab || "Library")) ||
                                !("tab" in item.route))
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
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarMenu>
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
              <SidebarMenuButton asChild tooltip="Mobile app">
                <a href="/?teacher=1">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  aria-label="Teacher account menu"
                  className="tw-sidebar-account"
                >
                  <span className="tw-teacher-avatar">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="tw-account-copy">
                    <strong>{profile.name}</strong>
                    <span>Teacher account</span>
                  </span>
                  <Icon name="expand" className="ml-auto" size={16} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="tw-account-menu w-60"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel>
                  {profile.name}
                  <span className="tw-menu-subtitle">
                    Your teaching workspace
                  </span>
                </DropdownMenuLabel>
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
                  <a href="/">
                    <Icon name="back" />
                    Replay onboarding
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
