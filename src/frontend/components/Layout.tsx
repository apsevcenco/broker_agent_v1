import { Activity, BookOpen, Brain, CheckSquare, Gauge, Inbox, ListTodo, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  ["/dashboard", "Dashboard", Gauge],
  ["/inbox", "Inbox", Inbox],
  ["/leads", "Leads", Users],
  ["/tasks", "Tasks", ListTodo],
  ["/approvals", "Approvals", CheckSquare],
  ["/memory", "Memory", Brain],
  ["/knowledge", "Knowledge Base", BookOpen],
  ["/activity", "Activity Log", Activity],
  ["/settings", "Settings", Settings]
] as const;

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span>Y</span><div>Yacht AI<br />Broker Engine</div></div>
      <nav>
        {nav.map(([href, label, Icon]) => <a key={href} className={route === href ? "active" : ""} href={href}><Icon size={18} />{label}</a>)}
      </nav>
      <div className="mode">V1 Draft Only<br /><strong>Human approval required</strong></div>
    </aside>
    <main className="content">{children}</main>
  </div>;
}
