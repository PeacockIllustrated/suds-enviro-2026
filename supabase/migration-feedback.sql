-- ============================================================
-- SuDS Enviro Configurator - Feedback Review Tool Schema
-- Table: se_feedback
-- Run this in the Supabase SQL editor
-- ============================================================

-- Helper function for updated_at trigger (if not already created)
create or replace function se_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Feedback table ──────────────────────────────────────────

create table if not exists se_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author text not null,
  page_url text not null,
  page_title text,
  section text,
  pin_x numeric,
  pin_y numeric,
  comment text not null,
  priority text default 'medium' check (priority in ('low','medium','high','critical')),
  category text default 'general' check (category in ('design','content','product-data','bug','feature','general')),
  structured_data jsonb,
  status text default 'new' check (status in ('new','in-progress','resolved','closed')),
  dev_notes text,
  resolved_at timestamptz
);

-- ── Trigger ─────────────────────────────────────────────────

create trigger se_feedback_updated_at
  before update on se_feedback
  for each row execute function se_set_updated_at();

-- ── Indexes ─────────────────────────────────────────────────

create index se_feedback_status on se_feedback (status);
create index se_feedback_created_at on se_feedback (created_at desc);
create index se_feedback_page_url on se_feedback (page_url);

-- ── Row Level Security ──────────────────────────────────────

alter table se_feedback enable row level security;

create policy "Anyone can insert feedback"
  on se_feedback for insert to anon with check (true);

create policy "Anyone can read feedback"
  on se_feedback for select to anon using (true);

create policy "Auth full access feedback"
  on se_feedback for all to authenticated using (true);
