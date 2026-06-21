export interface PdyeActionDraft { type: "deal_room" | "lead_sync"; payload: Record<string, unknown>; }
export async function draftPdyeAction(action: PdyeActionDraft) { return { status: "draft_only", action, todo: "Connect to PDYE API after approval workflow is production-ready." }; }
