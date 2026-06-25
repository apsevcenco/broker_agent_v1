-- Safe/simple Yacht Broker Agent memory seed for Supabase SQL Editor.
-- This version avoids complex VALUES blocks and avoids non-empty tag arrays.

create extension if not exists pgcrypto;

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Buyer Qualification Framework', 'Yacht Broker Agent Memory',
  'How the broker agent qualifies yacht buyers before disclosure.',
  $$Before disclosing sensitive yacht information, qualify the buyer across budget range, approximate proof-of-funds path, decision authority, purchase timeline, preferred region, yacht type, size range, new-build versus brokerage preference, intended use, crew/management readiness, broker representation and NDA willingness. If any item is missing, ask one or two concise questions instead of sending yacht identity, owner details, exact location, technical documents or commercial terms.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Buyer Qualification Framework');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Seller Qualification Framework', 'Yacht Broker Agent Memory',
  'How the broker agent qualifies sellers and owner representatives.',
  $$For seller-side inquiries, establish whether the sender is the beneficial owner, captain, manager, family office, lawyer, broker or informal intermediary. Capture ownership authority, mandate status, asking expectation, yacht name only if voluntarily provided, location, flag, class, year, builder, model, length, refit history, documentation readiness, urgency, debt or distressed context, confidentiality level and whether co-brokerage is allowed. Do not promise valuation, buyer access or sale outcome without approval.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Seller Qualification Framework');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Off-Market Confidentiality Protocol', 'Yacht Broker Agent Memory',
  'Default disclosure rules for off-market yachts and private owners.',
  $$Treat off-market inventory as confidential by default. Never reveal yacht identity, owner identity, exact berth, registration documents, crew contacts, debt situation, distressed seller details, bottom price or signed commercial documents unless the lead is qualified and an admin approval exists. Safe language: we can discuss the profile at a high level, then move to NDA and buyer/seller review before deeper disclosure.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Off-Market Confidentiality Protocol');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Broker Cooperation Protocol', 'Yacht Broker Agent Memory',
  'Rules for communicating with other brokers and intermediaries.',
  $$When another broker contacts the system, be respectful but verify representation, client mandate, commission expectations, disclosure permissions and whether they can share buyer or seller background. The agent may draft co-broker language, but must send commission terms, exclusivity statements, direct owner contact, buyer names or legal commitments to approval before external use.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Broker Cooperation Protocol');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Distressed Yacht Opportunity Handling', 'Yacht Broker Agent Memory',
  'How to handle debt, urgency and distressed sale scenarios safely.',
  $$Distressed opportunities can be attractive but high risk. The agent should use neutral language: motivated sale, time-sensitive opportunity or special situation. Avoid claims about debt, repossession, insolvency, legal disputes or owner pressure unless confirmed and approved. Prioritize verification, NDA, document control and admin review before any commercial claim.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Distressed Yacht Opportunity Handling');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'NDA and Document Disclosure Workflow', 'Yacht Broker Agent Memory',
  'Step-by-step route before sensitive documents are shared.',
  $$Typical route: receive inquiry, classify buyer, seller or broker, qualify intent, request NDA where appropriate, create approval for disclosure, then share controlled materials only after approval. Sensitive materials include yacht name in off-market cases, owner identity, exact location, build documents, survey, class reports, maintenance records, invoices, photographs not approved for publication, bottom price, LOI/MOA/SPA drafts and proof-of-funds documents.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'NDA and Document Disclosure Workflow');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Commission and Commercial Terms Safety', 'Yacht Broker Agent Memory',
  'Commercial language that needs human review.',
  $$The agent may draft neutral commercial questions, but must not finalize commission split, success fee, asking price change, net-to-owner figure, exclusivity, mandate language, escrow instructions, closing date, tax treatment, legal structure or payment terms. Any draft containing those items should be routed to approvals with high or critical risk depending on sensitivity.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Commission and Commercial Terms Safety');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Lead Scoring Rules for Yacht Broker Agent', 'Yacht Broker Agent Memory',
  'Practical scoring rules for brokerage leads.',
  $$A+ leads have clear budget, near-term timeline, decision authority, willingness to follow NDA and proof-of-funds process and specific asset criteria. A leads are strong but missing one major verification point. B leads show intent but weak authority or vague criteria. C leads are exploratory. D leads are spam, impossible requests, unserious claims or attempts to bypass confidentiality.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Lead Scoring Rules for Yacht Broker Agent');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Draft Reply Tone and Style Guide', 'Yacht Broker Agent Memory',
  'Voice rules for yacht brokerage drafts.',
  $$Tone should be discreet, calm, senior, concise and useful. Avoid hype, pressure, exaggerated exclusivity and desperation language. Use short paragraphs. Ask targeted review questions. For luxury clients, show control and discretion, not aggressive selling. For brokers, be professional and process-oriented. For weak leads, politely move them into review instead of rejecting too early.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Draft Reply Tone and Style Guide');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Yacht Asset Data Checklist', 'Yacht Broker Agent Memory',
  'Fields needed for useful yacht asset records.',
  $$A useful yacht record should capture name or confidential code, builder, model, year, length, beam, draft, gross tonnage when available, engines, max/cruise speed, range, guest cabins, crew cabins, flag, class, location, asking price, VAT/tax notes, refit history, documents available, media status, owner or representative, confidentiality level and current sale status.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Yacht Asset Data Checklist');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Relationship Memory Rules', 'Yacht Broker Agent Memory',
  'How the agent should treat relationship memory.',
  $$Relationship memory stores facts about people and companies: role, company, trust level, communication style, yacht interests, deal history, warnings and learned observations. The agent may suggest updates but should not overwrite admin notes. Warnings, conflicts, confidentiality breaches and trust concerns should be preserved and surfaced before drafting replies.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Relationship Memory Rules');

insert into knowledge_entries (id, agent_id, title, category, summary, content, source, reliability_level, tags, created_at, updated_at)
select gen_random_uuid(), 'yacht-broker-agent', 'Approval Triggers for Yacht Broker Agent', 'Yacht Broker Agent Memory',
  'Situations that must create or require approval.',
  $$Create or require approval when a draft mentions yacht identity in off-market context, owner identity, exact location, documents, confidential pricing, commission, legal terms, tax/flag advice, debt/distress details, direct contact exchange, payment instructions, firm availability, binding offer language or anything that could create a commercial commitment.$$, 'internal bootstrap', 'verified', '{}'::text[], now(), now()
where not exists (select 1 from knowledge_entries where agent_id = 'yacht-broker-agent' and title = 'Approval Triggers for Yacht Broker Agent');
