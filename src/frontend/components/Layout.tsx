import {
  Activity, Anchor, BookOpen, Brain, Car, CheckSquare,
  Cpu, FolderOpen, Gauge, GitBranch, Inbox, ListTodo,
  Megaphone, MessageCircle, Plug, Search, Settings,
  TrendingUp, Users, Wind
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type NavItem = { href: string; label: string; Icon: ComponentType<{ size?: number }>; note?: string };
type NavGroup = { group?: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Mission Control", Icon: Gauge }
    ]
  },
  {
    group: "Business",
    items: [
      { href: "/sales",      label: "Sales",      Icon: TrendingUp },
      { href: "/charter",    label: "Charter",    Icon: Wind },
      { href: "/car-rental", label: "Car Rental", Icon: Car },
      { href: "/cases",      label: "Cases",      Icon: FolderOpen },
      { href: "/leads",      label: "CRM",        Icon: Users }
    ]
  },
  {
    group: "Operations",
    items: [
      { href: "/lead-hunter-results", label: "Lead Hunter Results",  Icon: Search },
      { href: "/inbox",               label: "Inbox",                Icon: Inbox },
      { href: "/approvals",           label: "Approvals",            Icon: CheckSquare },
      { href: "/tasks",               label: "Tasks",                Icon: ListTodo },
      { href: "/business-flow",       label: "Business Flow Canvas", Icon: GitBranch }
    ]
  },
  {
    group: "AI Workforce",
    items: [
      { href: "/agents/client-acquisition", label: "Lead Hunter",      Icon: Search },
      { href: "/agents/yacht-broker",       label: "Yacht Broker",     Icon: Anchor },
      { href: "/agents/charter",            label: "Charter Agent",    Icon: Wind,          note: "not implemented" },
      { href: "/agents/car-rental",         label: "Car Rental Agent", Icon: Car,           note: "not implemented" },
      { href: "/agents/marketing",          label: "Marketing Agent",  Icon: Megaphone,     note: "not implemented" },
      { href: "/agents/yachtworth-support", label: "Support Agent",    Icon: MessageCircle, note: "not implemented" }
    ]
  },
  {
    group: "Platform",
    items: [
      { href: "/knowledge",           label: "Knowledge",    Icon: BookOpen },
      { href: "/memory",              label: "Memory",       Icon: Brain },
      { href: "/connections",         label: "Connections",  Icon: Plug },
      { href: "/settings/ai-providers", label: "AI Providers", Icon: Cpu },
      { href: "/activity",            label: "Analytics",    Icon: Activity },
      { href: "/settings",            label: "Settings",     Icon: Settings }
    ]
  }
];

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>LM</span>
          <div>Luxury Mobility<br />AI OS</div>
        </div>
        <nav>
          {groups.flatMap((group, gi) => {
            const header = group.group
              ? [<div key={`h${gi}`} className="nav-section">{group.group}</div>]
              : [];
            const links = group.items.map(({ href, label, Icon, note }) => {
              const isActive = route === href || route.startsWith(`${href}/`);
              const cls = [isActive ? "active" : "", note ? "nav-dimmed" : ""].filter(Boolean).join(" ");
              return (
                <a key={href} href={href} className={cls || undefined} title={note ? "Not yet implemented" : undefined}>
                  <Icon size={16} />
                  {label}
                </a>
              );
            });
            return [...header, ...links];
          })}
        </nav>
        <div className="mode">Multi-Agent V1<br /><strong>Approval required</strong></div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
