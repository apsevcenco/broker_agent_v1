import type { ImportPlan } from "./knowledgeTypes";
import { supabase } from "../backend/data/supabaseClient";
import { knowledgeStore } from "./knowledgeStore";

const now = () => new Date().toISOString();

function planFromRow(row: any): ImportPlan {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    topic: row.topic,
    category: row.category,
    sourceUrls: row.source_urls || [],
    notes: row.notes ?? undefined,
    reliabilityExpectation: row.reliability_expectation,
    status: row.status,
    createdAt: row.created_at
  };
}

function planToRow(plan: ImportPlan) {
  return {
    id: plan.id,
    agent_id: plan.agentId || null,
    topic: plan.topic,
    category: plan.category,
    source_urls: plan.sourceUrls,
    notes: plan.notes || null,
    reliability_expectation: plan.reliabilityExpectation,
    status: plan.status,
    created_at: plan.createdAt,
    updated_at: now()
  };
}

export async function createImportPlan(plan: ImportPlan): Promise<ImportPlan> {
  if (!supabase) { knowledgeStore.importPlans.unshift(plan); return plan; }
  const { data, error } = await supabase.from("knowledge_import_plans").insert(planToRow(plan)).select("*").single();
  if (error) throw error;
  return planFromRow(data);
}

export async function listImportPlans(agentId?: string): Promise<ImportPlan[]> {
  if (!supabase) {
    return agentId
      ? knowledgeStore.importPlans.filter((p) => p.agentId === agentId)
      : knowledgeStore.importPlans;
  }
  const base = supabase.from("knowledge_import_plans").select("*").order("created_at", { ascending: false });
  const q = agentId ? base.eq("agent_id", agentId) : base;
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(planFromRow);
}
