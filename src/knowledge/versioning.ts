import type { KnowledgeVersion } from "./knowledgeTypes";
import { supabase } from "../backend/data/supabaseClient";
import { knowledgeStore } from "./knowledgeStore";

function versionFromRow(row: any): KnowledgeVersion {
  return {
    id: row.id,
    knowledgeEntryId: row.knowledge_entry_id,
    versionNumber: row.version_number,
    title: row.title,
    summary: row.summary,
    content: row.content,
    source: row.source ?? undefined,
    reliabilityLevel: row.reliability_level,
    changedBy: row.changed_by,
    changeNote: row.change_note ?? undefined,
    createdAt: row.created_at
  };
}

function versionToRow(v: KnowledgeVersion) {
  return {
    id: v.id,
    knowledge_entry_id: v.knowledgeEntryId,
    version_number: v.versionNumber,
    title: v.title,
    summary: v.summary,
    content: v.content,
    source: v.source || null,
    reliability_level: v.reliabilityLevel,
    changed_by: v.changedBy,
    change_note: v.changeNote || null,
    created_at: v.createdAt
  };
}

export async function createKnowledgeVersion(version: KnowledgeVersion): Promise<KnowledgeVersion> {
  if (!supabase) { knowledgeStore.versions.unshift(version); return version; }
  const { data, error } = await supabase.from("knowledge_versions").insert(versionToRow(version)).select("*").single();
  if (error) throw error;
  return versionFromRow(data);
}

export async function listKnowledgeVersions(knowledgeEntryId: string): Promise<KnowledgeVersion[]> {
  if (!supabase) {
    return knowledgeStore.versions
      .filter((v) => v.knowledgeEntryId === knowledgeEntryId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }
  const { data, error } = await supabase
    .from("knowledge_versions")
    .select("*")
    .eq("knowledge_entry_id", knowledgeEntryId)
    .order("version_number", { ascending: false });
  if (error) throw error;
  return (data || []).map(versionFromRow);
}
