-- ============================================================
-- SuDS Enviro Configurator - Database Migration
-- Prefix: se_ (shared Onesign Supabase instance)
-- Run this in the Supabase SQL editor
-- ============================================================
-- Uses TEXT with CHECK constraints instead of custom enums
-- to avoid conflicts on the shared instance.
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

-- Configurations: stores wizard state per config session
create table se_configurations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Anonymous session tracking (UUID stored in localStorage)
  session_id      text,

  -- Product type identifier
  product         text,

  -- Full product configuration as discriminated union JSONB
  -- e.g. { "kind": "chamber", "data": { ... } }
  product_data    jsonb,

  -- Generated product code (e.g. IC-600-1500-S104)
  product_code    text,

  -- Compliance results array (ComplianceResult[])
  compliance      jsonb,

  -- Furthest wizard step reached
  wizard_step     integer not null default 0,

  -- Workflow status
  status          text not null default 'draft'
                  check (status in ('draft', 'submitted', 'quoted', 'archived'))
);

-- Enquiries: submitted customer contact forms
create table se_enquiries (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Link to the configuration this enquiry relates to
  configuration_id    uuid references se_configurations(id) on delete set null,

  -- Contact details
  name                text not null,
  company             text,
  email               text not null,
  phone               text,
  notes               text,

  -- Admin workflow
  status              text not null default 'new'
                      check (status in ('new', 'reviewed', 'quoted', 'closed')),
  admin_notes         text,
  quoted_at           timestamptz,
  quoted_by           text
);

-- PDF generation log
create table se_pdf_logs (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  configuration_id    uuid references se_configurations(id) on delete cascade,
  duration_ms         integer
);


-- ── TRIGGERS ────────────────────────────────────────────────

-- Auto-update updated_at on row modification
create or replace function se_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger se_configurations_updated_at
  before update on se_configurations
  for each row execute function se_set_updated_at();

create trigger se_enquiries_updated_at
  before update on se_enquiries
  for each row execute function se_set_updated_at();


-- ── INDEXES ─────────────────────────────────────────────────

-- Configurations
create index se_configurations_session_id  on se_configurations (session_id);
create index se_configurations_status      on se_configurations (status);
create index se_configurations_created_at  on se_configurations (created_at desc);

-- Enquiries
create index se_enquiries_status           on se_enquiries (status);
create index se_enquiries_created_at       on se_enquiries (created_at desc);
create index se_enquiries_email            on se_enquiries (email);
create index se_enquiries_configuration_id on se_enquiries (configuration_id);


-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table se_configurations enable row level security;
alter table se_enquiries      enable row level security;
alter table se_pdf_logs       enable row level security;

-- se_configurations: anon can INSERT and SELECT (needed for shareable URLs)
create policy "anon_insert_configurations"
  on se_configurations for insert
  to anon
  with check (true);

create policy "anon_select_configurations"
  on se_configurations for select
  to anon
  using (true);

-- Authenticated (admin) has full access
create policy "auth_select_configurations"
  on se_configurations for select
  to authenticated
  using (true);

create policy "auth_insert_configurations"
  on se_configurations for insert
  to authenticated
  with check (true);

create policy "auth_update_configurations"
  on se_configurations for update
  to authenticated
  using (true);

create policy "auth_delete_configurations"
  on se_configurations for delete
  to authenticated
  using (true);

-- se_enquiries: anon can INSERT only
create policy "anon_insert_enquiries"
  on se_enquiries for insert
  to anon
  with check (true);

-- Authenticated can read and update all enquiries
create policy "auth_select_enquiries"
  on se_enquiries for select
  to authenticated
  using (true);

create policy "auth_update_enquiries"
  on se_enquiries for update
  to authenticated
  using (true);

create policy "auth_insert_enquiries"
  on se_enquiries for insert
  to authenticated
  with check (true);

-- se_pdf_logs: authenticated only
create policy "auth_select_pdf_logs"
  on se_pdf_logs for select
  to authenticated
  using (true);

create policy "auth_insert_pdf_logs"
  on se_pdf_logs for insert
  to authenticated
  with check (true);


-- ── VIEW ────────────────────────────────────────────────────

-- Admin dashboard view joining enquiries with configuration summaries
create or replace view se_enquiry_dashboard as
  select
    e.id,
    e.created_at,
    e.updated_at,
    e.name,
    e.company,
    e.email,
    e.phone,
    e.notes,
    e.status,
    e.admin_notes,
    e.quoted_at,
    e.quoted_by,
    c.id            as configuration_id,
    c.product,
    c.product_code,
    c.product_data->>'kind' as product_type,
    c.wizard_step,
    c.status        as config_status
  from se_enquiries e
  left join se_configurations c on c.id = e.configuration_id
  order by e.created_at desc;
