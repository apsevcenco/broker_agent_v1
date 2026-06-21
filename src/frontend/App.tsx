import type { ReactNode } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Inbox } from "./pages/Inbox";
import { ActivityLog, Approvals, Knowledge, Leads, Memory, Settings, Tasks } from "./pages/ListPages";

const routes: Record<string, () => ReactNode> = {
  "/": Dashboard,
  "/dashboard": Dashboard,
  "/inbox": Inbox,
  "/leads": Leads,
  "/tasks": Tasks,
  "/approvals": Approvals,
  "/memory": Memory,
  "/knowledge": Knowledge,
  "/activity": ActivityLog,
  "/settings": Settings
};

export function App() {
  const path = window.location.pathname;
  const Page = routes[path] || Dashboard;
  return <Layout route={path === "/" ? "/dashboard" : path}><Page /></Layout>;
}
