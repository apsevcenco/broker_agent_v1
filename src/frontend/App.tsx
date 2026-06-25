import type { ReactNode } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Inbox } from "./pages/Inbox";
import { AgentDetail, Agents } from "./pages/Agents";
import { ActivityLog, AiProviders, Approvals, Assets, Knowledge, Leads, Memory, Settings, Tasks } from "./pages/ListPages";

const routes: Record<string, () => ReactNode> = {
  "/": Dashboard,
  "/dashboard": Dashboard,
  "/agents": Agents,
  "/agents/yacht-broker": () => <AgentDetail slug="yacht-broker" />,
  "/agents/car-rental": () => <AgentDetail slug="car-rental" />,
  "/agents/yachtworth-support": () => <AgentDetail slug="yachtworth-support" />,
  "/agents/charter": () => <AgentDetail slug="charter" />,
  "/agents/marketing": () => <AgentDetail slug="marketing" />,
  "/agents/client-acquisition": () => <AgentDetail slug="client-acquisition" />,
  "/inbox": Inbox,
  "/leads": Leads,
  "/tasks": Tasks,
  "/approvals": Approvals,
  "/memory": Memory,
  "/knowledge": Knowledge,
  "/assets": Assets,
  "/activity": ActivityLog,
  "/settings": Settings,
  "/settings/ai-providers": AiProviders
};

export function App() {
  const path = window.location.pathname;
  const Page = routes[path] || Dashboard;
  return <Layout route={path === "/" ? "/dashboard" : path}><Page /></Layout>;
}
