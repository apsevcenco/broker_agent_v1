export const highRiskActions = [
  "revealing yacht name",
  "revealing yacht owner",
  "revealing exact yacht location",
  "sharing documents",
  "discussing commission",
  "discussing legal terms",
  "approving buyer access",
  "approving broker access",
  "sending commercial offers",
  "sending NDA or Commission Agreement",
  "making financial promises",
  "making legal claims"
] as const;

export const agentRules = {
  confidentialityFirst: true,
  noYachtIdentityDisclosureWithoutApproval: true,
  noOwnerIdentityDisclosureWithoutApproval: true,
  noLegalAdvice: true,
  noTaxAdvice: true,
  noFinancialGuarantees: true,
  noFakeIdentity: true,
  externalMessagesAreDraftsOnlyInV1: true,
  highRiskActionsRequireHumanApproval: true,
  adminNotesOverrideAgentSuggestions: true,
  relationshipMemoryMustBeProtected: true,
  agentMustAdmitUncertainty: true
};

export function requiresApproval(text: string): boolean {
  const lower = text.toLowerCase();
  return highRiskActions.some((action) => lower.includes(action.replace("revealing ", ""))) ||
    ["owner", "exact location", "commission", "legal", "nda", "agreement", "documents", "offer"].some((term) => lower.includes(term));
}
