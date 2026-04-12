-- ============================================================
-- SuDS Enviro Configurator - Quotes Migration
-- Creates se_quotes table for the quote builder feature
-- ============================================================

create table if not exists se_quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  configuration_id uuid references se_configurations(id) on delete set null,
  enquiry_id uuid references se_enquiries(id) on delete set null,
  quote_ref text not null,
  customer_name text not null,
  customer_email text not null,
  customer_company text,
  line_items jsonb not null default '[]',
  subtotal numeric(10,2) default 0,
  vat_rate numeric(4,2) default 20.00,
  vat numeric(10,2) default 0,
  total numeric(10,2) default 0,
  valid_until date,
  notes text,
  terms text default 'Payment terms: 30 days from date of invoice. Prices exclude delivery unless stated. Quote valid for the period shown above.',
  status text default 'draft' check (status in ('draft','sent','viewed','accepted','expired','declined')),
  sent_at timestamptz,
  viewed_at timestamptz
);

-- Trigger for updated_at
create trigger se_quotes_updated_at
  before update on se_quotes
  for each row execute function se_set_updated_at();

-- Indexes
create index se_quotes_configuration_id on se_quotes (configuration_id);
create index se_quotes_status on se_quotes (status);
create index se_quotes_quote_ref on se_quotes (quote_ref);

-- RLS
alter table se_quotes enable row level security;

create policy "auth_select_quotes"
  on se_quotes for select
  to authenticated
  using (true);

create policy "auth_insert_quotes"
  on se_quotes for insert
  to authenticated
  with check (true);

create policy "auth_update_quotes"
  on se_quotes for update
  to authenticated
  using (true);

create policy "auth_delete_quotes"
  on se_quotes for delete
  to authenticated
  using (true);
