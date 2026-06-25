insert into agents (id, name, slug, status, category, description, risk_level, default_tone, system_rules, allowed_actions, blocked_actions)
values (
  'client-acquisition-agent',
  'Client Acquisition Agent',
  'client-acquisition',
  'planned',
  'client_acquisition',
  'Online prospect research, social lead discovery, compliant outreach drafts, chat response preparation and campaign follow-up planning.',
  'high',
  'Discreet luxury business development specialist, human, concise and non-spammy.',
  '["Draft only in V1", "Respect platform rules", "No spam or mass messaging", "Human approval before any external message", "Do not impersonate a human", "Do not scrape restricted or paid sources"]',
  '["research public prospects", "suggest target segments", "draft outreach", "draft chat replies", "create follow-up tasks", "suggest lead score"]',
  '["send messages automatically", "join chats automatically", "post ads automatically", "scrape platforms", "bypass rate limits", "impersonate people", "use bought contact lists"]'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  status = excluded.status,
  category = excluded.category,
  description = excluded.description,
  risk_level = excluded.risk_level,
  default_tone = excluded.default_tone,
  system_rules = excluded.system_rules,
  allowed_actions = excluded.allowed_actions,
  blocked_actions = excluded.blocked_actions,
  updated_at = now();
