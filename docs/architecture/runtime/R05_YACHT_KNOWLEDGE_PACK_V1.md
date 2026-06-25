# R05 Yacht Knowledge Pack V1

## Purpose

Yacht Knowledge Pack V1 gives the Yacht Broker Agent a broad professional knowledge foundation across the yacht industry without turning the agent into an autonomous legal, tax, flag, class, insurance, or compliance adviser.

The pack is designed for retrieval through the Knowledge Engine and Knowledge Ranking V2.

It should help the agent:

- understand yacht industry questions,
- ask the right qualification questions,
- draft professional replies,
- identify risk and approval triggers,
- route specialist topics to human or professional review,
- avoid unsafe final advice.

---

## Structure

The pack is stored as separate `knowledge_entries`, not as one large prompt.

Each entry has:

- title
- category
- summary
- content
- source
- reliability level
- tags

This allows Knowledge Ranking V2 to retrieve only the most relevant slices for each Case.

---

## Coverage Areas

Yacht Knowledge Pack V1 covers:

- brokerage process
- buyer qualification
- seller qualification
- broker cooperation
- off-market confidentiality
- NDA and controlled disclosure
- LOI / MOA / SPA awareness
- escrow and deposits
- survey and sea trial
- class societies
- flag and registration awareness
- private vs commercial use
- charter compliance questions
- VAT / tax / customs boundaries
- SOLAS / MARPOL / MLC / ISM / ISPS awareness
- insurance questions
- KYC / AML / sanctions triggers
- valuation factors
- comparable sales discipline
- refit and technical risk
- crew, management, handover, and operations
- marina and berthing constraints
- major builder and segment awareness
- source reliability rules

---

## Safety Model

The agent may:

- explain yacht industry process at a high level,
- ask for missing information,
- draft safe commercial replies,
- identify when a specialist review is needed,
- propose ToolPlans for approval.

The agent must not:

- provide final legal advice,
- provide final tax advice,
- provide final flag registration advice,
- provide final class or compliance determinations,
- provide payment instructions,
- disclose off-market yacht identity, owner identity, exact location, or sensitive documents without approval,
- send external messages or documents automatically.

---

## Database Migration

The pack is loaded by:

`supabase/migrations/20260625170000_yacht_knowledge_pack_v1.sql`

The migration is idempotent. It inserts entries only when the same title does not already exist for `yacht-broker-agent`.

---

## Relationship To Knowledge Ranking V2

Knowledge Ranking V2 should retrieve this pack contextually:

- buyer enquiries should prioritize buyer qualification, NDA, off-market confidentiality, proof-of-funds, and deal flow;
- seller enquiries should prioritize mandate, ownership authority, valuation, documents, confidentiality, and seller process;
- broker enquiries should prioritize cooperation, mandate confirmation, buyer qualification, confidentiality, and commission safety;
- compliance queries should retrieve SOLAS, MARPOL, MLC, ISM, ISPS, flag, class, and certificate awareness;
- normal buyer enquiries should not be dominated by MARPOL/SOLAS unless the question contains compliance signals.

---

## Completion Rule

Yacht Knowledge Pack V1 is a knowledge foundation, not the start of new Yacht Broker V1 feature expansion.

Yacht Broker Agent V1 remains closed. Future broker improvements should be limited to defect fixes, deployment stabilization, and knowledge quality updates.

Lead Hunter Agent V1 starts separately.
