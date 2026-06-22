import { Activity, Bot, Boxes, BookOpen, Brain, CheckSquare, Gauge, Inbox, ListTodo, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  ["/dashboard", "Dashboard", Gauge],
  ["/agents", "Agents", Bot],
  ["/inbox", "Inbox", Inbox],
  ["/leads", "Leads / CRM", Users],
  ["/tasks", "Tasks", ListTodo],
  ["/approvals", "Approvals", CheckSquare],
  ["/memory", "Memory", Brain],
  ["/knowledge", "Knowledge Base", BookOpen],
  ["/assets", "Assets", Boxes],
  ["/activity", "Activity Log", Activity],
  ["/settings", "Settings", Settings]
] as const;

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span>LM</span><div>Luxury Mobility<br />AI OS</div></div>
      <nav>
        {nav.map(([href, label, Icon]) => <a key={href} className={route === href || route.startsWith(`${href}/`) ? "active" : ""} href={href}><Icon size={18} />{label}</a>)}
      </nav>
      <div className="mode">Multi-Agent V1<br /><strong>Approval required</strong></div>
    </aside>
    <main className="content">{children}</main>
  </div>;
}
