// Local example — TypeScript validates this shape at build time.
// Input: "Looking for 35-40m motor yacht, budget €8-12M, ready to sign NDA."
// This demonstrates the expected toolPlan output for a qualified NDA-ready buyer.
import type { ToolPlan } from "./ToolPlan";

export const buyerNdaToolPlanExample: ToolPlan = {
  toolRequests: [
    {
      id:               "ex-001",
      tool:             "document.requestNda",
      category:         "DOCUMENT",
      reason:           "Buyer explicitly stated readiness to sign NDA — initiate the NDA process for admin review.",
      priority:         "high",
      approvalRequired: true,
      status:           "proposed",
      input: {
        contactName: "Prospective Buyer",
        company:     undefined,
        enquiryType: "Buyer Inquiry"
      },
      expectedOutput: "NDA draft prepared and routed to admin for review. Not sent until admin approves.",
      riskLevel:  "high",
      createdAt:  "2026-06-25T12:00:00.000Z"
    },
    {
      id:               "ex-002",
      tool:             "crm.createLead",
      category:         "CRM",
      reason:           "Qualified buyer with confirmed budget and size criteria — capture in CRM for pipeline tracking.",
      priority:         "high",
      approvalRequired: true,
      status:           "proposed",
      input: {
        name:             "Prospective Buyer",
        leadScore:        "B",
        source:           "email",
        conversationType: "Buyer Inquiry"
      },
      expectedOutput: "New lead record created in CRM with qualification data from this enquiry.",
      riskLevel:  "low",
      createdAt:  "2026-06-25T12:00:00.000Z"
    },
    {
      id:               "ex-003",
      tool:             "calendar.proposeMeeting",
      category:         "CALENDAR",
      reason:           "Lead qualifies for a discovery call to complete buyer qualification before presenting opportunities.",
      priority:         "medium",
      approvalRequired: true,
      status:           "proposed",
      input: {
        contactName: "Prospective Buyer",
        purpose:     "Buyer qualification call",
        notes:       "Clarify: builder preference, delivery timeline, proof of funds, broker representation"
      },
      expectedOutput: "Meeting proposal prepared. Admin approves and sends to contact.",
      riskLevel:  "low",
      createdAt:  "2026-06-25T12:00:00.000Z"
    }
  ],
  summary:          "3 proposed action(s) for Prospective Buyer. All require admin approval before execution.",
  requiresApproval: true,
  highestRiskLevel: "high"
};
