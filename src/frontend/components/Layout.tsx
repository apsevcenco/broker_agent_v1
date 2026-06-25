import { Activity, Bot, Boxes, BookOpen, Brain, CheckSquare, FileText, FolderOpen, Gauge, Inbox, Lightbulb, ListTodo, Settings, Target, Users } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type NavItem = { href: string; label: string; Icon: ComponentType<{ size?: number }>; soon?: boolean };
type NavGroup = { group?: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", Icon: Gauge }
    ]
  },
  {
    group: "Business",
    items: [
      { href: "/goals",  label: "Goals",  Icon: Target,     soon: true },
      { href: "/cases",  label: "Cases",  Icon: FolderOpen },
      { href: "/leads",  label: "CRM",    Icon: Users }
    ]
  },
  {
    group: "Operations",
    items: [
      { href: "/inbox",     label: "Inbox",                Icon: Inbox },
      { href: "/approvals", label: "AI Operations Center", Icon: CheckSquare },
      { href: "/tasks",     label: "Tasks",                Icon: ListTodo }
    ]
  },
  {
    group: "Intelligence",
    items: [
      { href: "/agents",     label: "AI Workforce", Icon: Bot },
      { href: "/knowledge",  label: "Knowledge",    Icon: BookOpen },
      { href: "/memory",     label: "Memory",       Icon: Brain },
      { href: "/experience", label: "Experience",   Icon: Lightbulb, soon: true }
    ]
  },
  {
    group: "Resources",
    items: [
      { href: "/assets",    label: "Assets",    Icon: Boxes },
      { href: "/documents", label: "Documents", Icon: FileText, soon: true }
    ]
  },
  {
    group: "Platform",
    items: [
      { href: "/activity", label: "Analytics", Icon: Activity },
      { href: "/settings", label: "Settings",  Icon: Settings }
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
            const links = group.items.map(({ href, label, Icon, soon }) => {
              const isActive = route === href || route.startsWith(`${href}/`);
              const cls = [isActive ? "active" : "", soon ? "soon" : ""].filter(Boolean).join(" ");
              return (
                <a key={href} href={href} className={cls || undefined}>
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
