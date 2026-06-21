import type { ReactNode } from "react";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div></header>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "red" | "green" | "blue" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}
