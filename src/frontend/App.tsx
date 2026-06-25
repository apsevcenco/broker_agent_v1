import type { ReactNode } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Inbox } from "./pages/Inbox";
import { AgentDetail, Agents } from "./pages/Agents";
import { ActivityLog, AiProviders, Approvals, Assets, Knowledge, Leads, Memory, Settings, Tasks } from "./pages/ListPages";
import { KnowledgeEngine } from "./pages/KnowledgeEngine";
import { Cases, Documents, Experience, Goals } from "./pages/Placeholders";

const routes: Record<string, () => ReactNode> = {
  // Top-level
  "/":          Dashboard,
  "/dashboard": Dashboard,

  // Business
  "/goals":  Goals,
  "/cases":  Cases,
  "/leads":  Leads,

  // Operations
  "/inbox":     Inbox,
  "/approvals": Approvals,
  "/tasks":     Tasks,

  // Intelligence
  "/agents":             Agents,
  "/agents/yacht-broker":    () => <AgentDetail slug="yacht-broker" />,
  "/agents/car-rental":      () => <AgentDetail slug="car-rental" />,
  "/agents/yachtworth-support": () => <AgentDetail slug="yachtworth-support" />,
  "/agents/charter":         () => <AgentDetail slug="charter" />,
  "/agents/marketing":       () => <AgentDetail slug="marketing" />,
  "/agents/client-acquisition": () => <AgentDetail slug="client-acquisition" />,
  "/knowledge":        Knowledge,
  "/knowledge-engine": KnowledgeEngine,
  "/memory":           Memory,
  "/experience":       Experience,

  // Resources
  "/assets":    Assets,
  "/documents": Documents,

  // Platform
  "/activity":            ActivityLog,
  "/settings":            Settings,
  "/settings/ai-providers": AiProviders,
};

export function App() {
  const path = window.location.pathname;
  const Page = routes[path] || Dashboard;
  return <Layout route={path === "/" ? "/dashboard" : path}><Page /></Layout>;
}
