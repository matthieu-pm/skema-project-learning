import { Fragment, useEffect, useRef } from "react";
import ProfilePortrait from "./ProfilePortrait";
import { Icon } from "./teacher/icons";
import { Button } from "./teacher/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./teacher/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./teacher/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./teacher/ui/tooltip";
import "./teacher/shadcn.css";
import "./workspace-sidebar.css";

export type WorkspaceSidebarItem = {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  separatorBefore?: boolean;
  href?: string;
  onSelect?: () => void;
};
export type WorkspaceSidebarGroup = {
  label?: string;
  items: WorkspaceSidebarItem[];
};
export type WorkspaceSidebarProps = {
  workspaceLabel: string;
  homeHref: string;
  groups: WorkspaceSidebarGroup[];
  primaryAction?: WorkspaceSidebarItem;
  supportLinks?: WorkspaceSidebarItem[];
  account: {
    name: string;
    role: string;
    portraitId?: string;
    initials: string;
    ariaLabel?: string;
    items: WorkspaceSidebarItem[];
  };
};

function NavigationItems({ items, choose }: { items: WorkspaceSidebarItem[]; choose: (item: WorkspaceSidebarItem) => void }) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const content = <><Icon name={item.icon} size={18} strokeWidth={item.active ? 2 : 1.5} /><span className="mimo-sidebar-item-label">{item.label}</span></>;
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              asChild={!!item.href}
              tooltip={{ children: item.label, className: "mimo-sidebar-tooltip" }}
              isActive={item.active}
              aria-current={item.active ? "page" : undefined}
              aria-label={item.label}
              className="mimo-sidebar-item"
              onClick={() => choose(item)}
            >
              {item.href ? <a href={item.href}>{content}</a> : content}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function WorkspaceSidebar({ workspaceLabel, homeHref, groups, primaryAction, supportLinks = [], account }: WorkspaceSidebarProps) {
  const { state, isMobile, openMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const wasDrawerOpen = useRef(openMobile);
  useEffect(() => {
    const closed = wasDrawerOpen.current && !openMobile;
    wasDrawerOpen.current = openMobile;
    if (!isMobile || !closed) return;
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>(".mimo-web-shell [data-sidebar='trigger']")?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [isMobile, openMobile]);
  const collapsed = !isMobile && state === "collapsed";
  const choose = (item: WorkspaceSidebarItem) => {
    item.onSelect?.();
    if (isMobile) setOpenMobile(false);
  };
  const collapseLabel = isMobile ? "Close navigation" : collapsed ? "Expand navigation" : "Collapse navigation";
  return (
    <Sidebar variant="sidebar" collapsible="icon" className={`mimo-sidebar${collapsed ? " mimo-sidebar-collapsed" : ""}`}>
      <SidebarHeader className="mimo-sidebar-header">
        <div className="mimo-sidebar-brand-row">
          <a className="mimo-sidebar-brand" href={homeHref} aria-label={`Mimo ${workspaceLabel.toLowerCase()}`} onClick={() => { if (isMobile) setOpenMobile(false); }}>
            <span className="mimo-sidebar-wordmark">mimo</span>
            <span className="mimo-sidebar-workspace">{workspaceLabel}</span>
          </a>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                static
                variant="ghost"
                size="icon-sm"
                className="mimo-sidebar-collapse"
                aria-label={collapseLabel}
                aria-expanded={isMobile ? undefined : !collapsed}
                onClick={() => isMobile ? setOpenMobile(false) : toggleSidebar()}
              >
                <Icon name={isMobile ? "close" : "sidebar"} size={18} strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="mimo-sidebar-tooltip">{collapseLabel}</TooltipContent>
          </Tooltip>
        </div>
        {primaryAction && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild={!!primaryAction.href} className="mimo-sidebar-primary" aria-label={primaryAction.label} onClick={() => choose(primaryAction)}>
                {primaryAction.href ? (
                  <a href={primaryAction.href}><Icon name={primaryAction.icon} size={18} strokeWidth={2} /><span>{primaryAction.label}</span></a>
                ) : <><Icon name={primaryAction.icon} size={18} strokeWidth={2} /><span>{primaryAction.label}</span></>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" hidden={!collapsed} className="mimo-sidebar-tooltip">{primaryAction.label}</TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>
      <SidebarContent className="mimo-sidebar-content">
        <nav aria-label={workspaceLabel} className="mimo-sidebar-navigation">
          {groups.map((group, index) => (
            <SidebarGroup key={group.label || index} className="mimo-sidebar-group">
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <NavigationItems items={group.items} choose={choose} />
            </SidebarGroup>
          ))}
        </nav>
        {supportLinks.length > 0 && <SidebarGroup className="mimo-sidebar-support"><NavigationItems items={supportLinks} choose={choose} /></SidebarGroup>}
      </SidebarContent>
      <SidebarFooter className="mimo-sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="mimo-sidebar-account" aria-label={account.ariaLabel || "Account menu"}>
                  <span className="mimo-sidebar-avatar" aria-hidden="true">
                    {account.portraitId ? <ProfilePortrait id={account.portraitId} initials={account.initials} /> : account.initials}
                  </span>
                  <span className="mimo-sidebar-account-copy"><strong>{account.name}</strong><span>{account.role}</span></span>
                  <Icon name="expand" size={16} strokeWidth={1.5} className="mimo-sidebar-account-chevron" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mimo-sidebar-menu" side={isMobile ? "top" : "right"} align="end" sideOffset={10}>
                <DropdownMenuLabel className="mimo-sidebar-menu-label">{account.name}<span>{account.role}</span></DropdownMenuLabel>
                <DropdownMenuSeparator />
                {account.items.map((item) => (
                  <Fragment key={item.id}>
                    {item.separatorBefore && <DropdownMenuSeparator />}
                    <DropdownMenuItem asChild={!!item.href} onSelect={() => choose(item)} aria-current={item.active ? "page" : undefined}>
                      {item.href ? <a href={item.href}><Icon name={item.icon} size={17} strokeWidth={1.5} /><span>{item.label}</span></a> : <><Icon name={item.icon} size={17} strokeWidth={1.5} /><span>{item.label}</span></>}
                    </DropdownMenuItem>
                  </Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
