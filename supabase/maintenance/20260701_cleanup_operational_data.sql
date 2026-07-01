-- Operational Data Cleanup
-- Purpose: reset runtime/test data while preserving agents, knowledge, memory, assets and configuration.
-- Safe target: run manually in Supabase SQL Editor when you want a clean testing workspace.
-- This is NOT a migration and should not be applied automatically on deploy.

begin;

-- Case runtime depends on cases, and cases can reference messages.
delete from case_events;
delete from case_participants;

-- Approvals/tasks reference messages/leads/assets. Remove before messages/leads.
delete from agent_approvals;
delete from agent_tasks;

-- Cases reference messages via created_from_message_id.
delete from cases;

-- Relationship notes may reference leads; remove only notes, not memory entries.
delete from relationship_notes;

-- Inbox/conversation/CRM runtime.
delete from messages;
delete from conversations;
delete from leads;

-- Runtime audit feed. Agents/knowledge/memory remain intact.
delete from agent_activity_logs;

commit;

-- Verification counts: all should be 0 after cleanup.
select 'agent_approvals' as table_name, count(*) as remaining from agent_approvals
union all select 'agent_tasks', count(*) from agent_tasks
union all select 'case_events', count(*) from case_events
union all select 'case_participants', count(*) from case_participants
union all select 'cases', count(*) from cases
union all select 'messages', count(*) from messages
union all select 'conversations', count(*) from conversations
union all select 'relationship_notes', count(*) from relationship_notes
union all select 'leads', count(*) from leads
union all select 'agent_activity_logs', count(*) from agent_activity_logs;