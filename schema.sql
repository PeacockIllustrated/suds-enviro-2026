-- ============================================================
-- SuDS Enviro Configurator — Supabase Schema
-- Prefix: se_
-- Applied to: shared Onesign Supabase instance
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────

create type se_product as enum (
  'chamber',
  'catchpit',
  'flow-control',
  'rhino',
  'pump'
);

create type se_system_type as enum (
  'surface',
  'foul',
  'combined'
);

create type se_config_status as enum (
  'draft',
  'submitted',
  'quoted',
  'archived'
);

create type se_enquiry_status as enum (
  'new',
  'reviewed',
  'quoted',
  'closed'
);

create type se_compliance_status as enum (
  'Pass',
  'Fail',
  'Warning'
);

-- ── CONFIGURATIONS ────────────────────────────────────────────

create table se_configurations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Session tracking (anonymous users get a UUID stored in localStorage)
  session_id        text,

  -- Step 0
  product           se_product,

  -- Step 1
  system_type       se_system_type,

  -- Step 2
  diameter_mm       integer check (diameter_mm in (450, 600, 750, 1050)),

  -- Step 3
  inlet_count       integer check (inlet_count between 1 and 6),

  -- Step 4
  positions         jsonb,                 -- array of clock positions e.g. ["2","4","9"]

  -- Step 5
  pipe_sizes        jsonb,                 -- { "inlet1": "160mm EN1401", "outlet": "225mm Twinwall" }
  outlet_size_mm    integer,               -- extracted for quick querying
  outlet_locked     boolean default false,
  outlet_rule       text,                  -- human-readable rule that triggered lock

  -- Step 6
  flow_control      boolean,
  flow_type         text,                  -- 'Vortex' | 'Orifice plate'
  flow_rate_ls      numeric(6,2),          -- litres per second

  -- Step 7
  depth_mm          integer check (depth_mm in (1000, 1500, 2000, 2500, 3000)),
  adoptable         boolean,

  -- Generated
  product_code      text,                  -- e.g. IC-600-1500-S104
  compliance        jsonb,                 -- array of ComplianceResult objects
  wizard_step       integer default 0,     -- furthest step reached

  -- Status
  status            se_config_status not null default 'draft'
);

-- Auto-update updated_at
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

-- Index for session lookups
create index se_configurations_session_id on se_configurations (session_id);
create index se_configurations_status on se_configurations (status);
create index se_configurations_created_at on se_configurations (created_at desc);

-- ── ENQUIRIES ─────────────────────────────────────────────────

create table se_enquiries (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  configuration_id    uuid references se_configurations (id) on delete set null,

  -- Submitted contact details
  name                text not null,
  company             text,
  email               text not null,
  phone               text,
  notes               text,

  -- Admin fields
  status              se_enquiry_status not null default 'new',
  admin_notes         text,
  quoted_at           timestamptz,
  quoted_by           text,

  -- Notification tracking
  notification_sent   boolean default false,
  notification_sent_at timestamptz
);

create trigger se_enquiries_updated_at
  before update on se_enquiries
  for each row execute function se_set_updated_at();

create index se_enquiries_configuration_id on se_enquiries (configuration_id);
create index se_enquiries_status on se_enquiries (status);
create index se_enquiries_created_at on se_enquiries (created_at desc);
create index se_enquiries_email on se_enquiries (email);

-- ── PDF LOGS ──────────────────────────────────────────────────

create table se_pdf_logs (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  configuration_id  uuid references se_configurations (id) on delete cascade,
  pdf_url           text,                  -- Supabase Storage URL if stored
  generated_by      text default 'api',    -- 'api' | 'admin'
  duration_ms       integer                -- generation time for monitoring
);

create index se_pdf_logs_configuration_id on se_pdf_logs (configuration_id);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

alter table se_configurations enable row level security;
alter table se_enquiries enable row level security;
alter table se_pdf_logs enable row level security;

-- Configurations: public can insert and select their own (by session_id).
-- Admin (authenticated) can see all.

create policy "Public can insert configurations"
  on se_configurations for insert
  to anon
  with check (true);

create policy "Public can update their own configurations"
  on se_configurations for update
  to anon
  using (session_id = current_setting('app.session_id', true));

create policy "Public can read their own configurations"
  on se_configurations for select
  to anon
  using (session_id = current_setting('app.session_id', true));

create policy "Authenticated users can read all configurations"
  on se_configurations for select
  to authenticated
  using (true);

create policy "Authenticated users can update all configurations"
  on se_configurations for update
  to authenticated
  using (true);

-- Enquiries: public can insert only. Authenticated admin can read/update.

create policy "Public can insert enquiries"
  on se_enquiries for insert
  to anon
  with check (true);

create policy "Authenticated users can read all enquiries"
  on se_enquiries for select
  to authenticated
  using (true);

create policy "Authenticated users can update enquiries"
  on se_enquiries for update
  to authenticated
  using (true);

-- PDF logs: authenticated only.

create policy "Authenticated users can read pdf logs"
  on se_pdf_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert pdf logs"
  on se_pdf_logs for insert
  to authenticated
  with check (true);

-- ── VIEWS ─────────────────────────────────────────────────────

-- Admin enquiry list view (joins configuration summary)
create view se_enquiry_dashboard as
  select
    e.id,
    e.created_at,
    e.name,
    e.company,
    e.email,
    e.status,
    e.admin_notes,
    c.product_code,
    c.diameter_mm,
    c.depth_mm,
    c.inlet_count,
    c.adoptable,
    c.system_type,
    c.flow_control,
    c.id as configuration_id
  from se_enquiries e
  left join se_configurations c on c.id = e.configuration_id
  order by e.created_at desc;

-- ── STORAGE ──────────────────────────────────────────────────

-- Bucket for generated PDFs (optional - can stream directly from API)
-- insert into storage.buckets (id, name, public)
-- values ('se-pdfs', 'se-pdfs', false);

-- ── SEED DATA (development only) ─────────────────────────────

-- Uncomment to insert a sample configuration for development testing
/*
insert into se_configurations (
  session_id, product, system_type, diameter_mm, inlet_count,
  positions, pipe_sizes, outlet_size_mm, outlet_locked, outlet_rule,
  flow_control, flow_type, flow_rate_ls,
  depth_mm, adoptable, product_code, status, wizard_step
) values (
  'dev-session-001',
  'chamber',
  'surface',
  600,
  3,
  '["2","4","9"]',
  '{"inlet1":"160mm EN1401","inlet2":"160mm EN1401","inlet3":"160mm EN1401","outlet":"225mm Twinwall"}',
  225,
  true,
  'Minimum 225mm outlet - rule: 3+ inlets on 600mm chamber',
  true,
  'Vortex',
  12.0,
  1500,
  true,
  'IC-600-1500-S104',
  'draft',
  9
);
*/
