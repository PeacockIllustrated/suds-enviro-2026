-- Audit log for tracking admin actions
create table if not exists se_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb
);

create index if not exists se_audit_log_created_at on se_audit_log (created_at desc);
create index if not exists se_audit_log_entity on se_audit_log (entity_type, entity_id);
