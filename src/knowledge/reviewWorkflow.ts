import type { KnowledgeReview, ReviewStatus } from "./knowledgeTypes";
import { supabase } from "../backend/data/supabaseClient";
import { knowledgeStore } from "./knowledgeStore";

const now = () => new Date().toISOString();

function reviewFromRow(row: any): KnowledgeReview {
  return {
    id: row.id,
    sourceId: row.source_id ?? undefined,
    knowledgeEntryId: row.knowledge_entry_id ?? undefined,
    reviewer: row.reviewer,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function reviewToRow(review: KnowledgeReview) {
  return {
    id: review.id,
    source_id: review.sourceId || null,
    knowledge_entry_id: review.knowledgeEntryId || null,
    reviewer: review.reviewer,
    status: review.status,
    notes: review.notes || null,
    created_at: review.createdAt,
    updated_at: review.updatedAt
  };
}

export async function listReviews(status?: ReviewStatus): Promise<KnowledgeReview[]> {
  if (!supabase) {
    const all = knowledgeStore.reviews;
    return status ? all.filter((r) => r.status === status) : all;
  }
  const base = supabase.from("knowledge_reviews").select("*").order("created_at", { ascending: false });
  const q = status ? base.eq("status", status) : base;
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(reviewFromRow);
}

export async function createReviewRequest(review: KnowledgeReview): Promise<KnowledgeReview> {
  if (!supabase) { knowledgeStore.reviews.unshift(review); return review; }
  const { data, error } = await supabase.from("knowledge_reviews").insert(reviewToRow(review)).select("*").single();
  if (error) throw error;
  return reviewFromRow(data);
}

async function setReviewStatus(id: string, status: ReviewStatus, notes?: string): Promise<KnowledgeReview | null> {
  const updatedAt = now();
  if (!supabase) {
    const r = knowledgeStore.reviews.find((item) => item.id === id);
    if (!r) return null;
    r.status = status;
    r.updatedAt = updatedAt;
    if (notes !== undefined) r.notes = notes;
    return r;
  }
  const { data, error } = await supabase
    .from("knowledge_reviews")
    .update({ status, notes: notes ?? null, updated_at: updatedAt })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? reviewFromRow(data) : null;
}

export const approveKnowledgeItem = (id: string, notes?: string) => setReviewStatus(id, "approved", notes);
export const rejectKnowledgeItem = (id: string, notes?: string) => setReviewStatus(id, "rejected", notes);
