import type { KnowledgeSource } from "./knowledgeTypes";
import { supabase } from "../backend/data/supabaseClient";
import { knowledgeStore } from "./knowledgeStore";

const now = () => new Date().toISOString();

function sourceFromRow(row: any): KnowledgeSource {
  return {
    id: row.id,
    agentId: row.agent_id ?? undefined,
    scope: row.scope,
    sourceType: row.source_type,
    title: row.title,
    description: row.description ?? undefined,
    originalUrl: row.original_url ?? undefined,
    storagePath: row.storage_path ?? undefined,
    sourceAuthority: row.source_authority ?? undefined,
    reliabilityLevel: row.reliability_level,
    jurisdiction: row.jurisdiction ?? undefined,
    language: row.language,
    publicationDate: row.publication_date ?? undefined,
    lastCheckedAt: row.last_checked_at ?? undefined,
    status: row.status,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sourceToRow(source: KnowledgeSource) {
  return {
    id: source.id,
    agent_id: source.agentId || null,
    scope: source.scope,
    source_type: source.sourceType,
    title: source.title,
    description: source.description || null,
    original_url: source.originalUrl || null,
    storage_path: source.storagePath || null,
    source_authority: source.sourceAuthority || null,
    reliability_level: source.reliabilityLevel,
    jurisdiction: source.jurisdiction || null,
    language: source.language,
    publication_date: source.publicationDate || null,
    last_checked_at: source.lastCheckedAt || null,
    status: source.status,
    metadata: source.metadata || {},
    created_at: source.createdAt,
    updated_at: source.updatedAt
  };
}

export async function listSources(agentId?: string): Promise<KnowledgeSource[]> {
  if (!supabase) {
    return agentId
      ? knowledgeStore.sources.filter((s) => s.agentId === agentId || s.scope === "global")
      : knowledgeStore.sources;
  }
  const query = supabase.from("knowledge_sources").select("*").order("created_at", { ascending: false });
  const filtered = agentId ? (query as any).or(`agent_id.eq.${agentId},scope.eq.global`) : query;
  const { data, error } = await filtered;
  if (error) throw error;
  return (data || []).map(sourceFromRow);
}

export async function createSource(source: KnowledgeSource): Promise<KnowledgeSource> {
  if (!supabase) { knowledgeStore.sources.unshift(source); return source; }
  const { data, error } = await supabase.from("knowledge_sources").insert(sourceToRow(source)).select("*").single();
  if (error) throw error;
  return sourceFromRow(data);
}

export async function getSource(id: string): Promise<KnowledgeSource | null> {
  if (!supabase) return knowledgeStore.sources.find((s) => s.id === id) || null;
  const { data, error } = await supabase.from("knowledge_sources").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? sourceFromRow(data) : null;
}

export async function updateSource(id: string, patch: Partial<KnowledgeSource>): Promise<KnowledgeSource | null> {
  if (!supabase) {
    const source = knowledgeStore.sources.find((s) => s.id === id);
    if (!source) return null;
    Object.assign(source, patch, { updatedAt: now() });
    return source;
  }
  const current = await getSource(id);
  if (!current) return null;
  const merged = { ...current, ...patch, updatedAt: now() };
  const { data, error } = await supabase.from("knowledge_sources").update(sourceToRow(merged)).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  return data ? sourceFromRow(data) : null;
}
