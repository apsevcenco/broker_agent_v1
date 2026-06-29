# R06 Lead Hunter Agent V1

## Purpose

Lead Hunter Agent V1 is the supervised acquisition radar for the Luxury Mobility AI OS. It identifies and qualifies public lead signals across yacht purchase, yacht sale, yacht charter, luxury car rental and VIP mobility.

V1 is not an autonomous outreach bot. It is a research and draft-only agent.

## What V1 Includes

- Public-source lead signal analysis from manually added inbox messages or source snippets.
- Multi-domain classification:
  - Yacht Purchase
  - Yacht Sale
  - Yacht Charter
  - Luxury Car Rental
  - Luxury Mobility Lead
- Routing recommendation to the specialist agent:
  - Yacht Broker Agent
  - Charter Agent
  - Car Rental Agent
  - Lead Hunter / Client Acquisition
- Lead score estimation.
- Risk assessment for outbound acquisition context.
- Missing qualification item detection.
- Lead candidate approval payload.
- Outreach draft preparation.
- ToolPlan generation for admin approval.

## What V1 Does Not Include

- No autonomous sending.
- No automatic social messaging.
- No joining chats or groups.
- No scraping restricted sources.
- No bypassing platform limits.
- No use of bought contact lists.
- No private profile access.
- No 24/7 crawling.
- No scheduled web runner yet.

## Operating Mode

Initial V1 mode:

```text
Input: manually captured signal / public snippet / source text
Agent: Lead Hunter Agent
Execution: CIE profile lead-hunter
Output: lead candidate + outreach draft + ToolPlan
Approval: required
External contact: never automatic
```

## ToolPlan Behavior

Lead Hunter V1 may propose:

- `search.webResearch` for public web verification.
- `social.searchLead` for public social-source review only.
- `crm.createLead` to create a lead candidate.
- `email.prepareDraft` to prepare outreach copy.
- `task.create` for human review and assignment.

All tool requests require approval. No tool executes automatically in V1.

## Car Rental Support

Luxury car rental signals are supported in V1. The agent looks for signals such as:

- luxury car rental
- supercar rental
- Rolls-Royce / Bentley / Ferrari / Lamborghini requests
- chauffeur service
- airport transfer
- VIP transport
- wedding or event car

Qualification items include:

- location
- dates
- vehicle class or model
- self-drive or chauffeur
- event type
- passenger profile
- budget
- delivery / pickup needs

## Safety Rules

- Draft only.
- Human approval before contact.
- Public-source research only.
- No impersonation.
- No spam or mass messaging.
- No restricted-source scraping.
- No platform bypassing.
- No external communication from the system in V1.

## Future Work

- Scheduled search runner.
- Source allowlist / denylist.
- Query pack management.
- Duplicate detection.
- Policy Engine integration.
- Experience scoring from closed lead outcomes.
- Car Rental Agent runtime handoff.
- Near-real-time monitoring after governance hardening.