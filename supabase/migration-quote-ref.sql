-- ============================================================
-- SuDS Enviro Configurator - Quote Reference Migration
-- Adds quote_ref column to se_configurations
-- ============================================================

-- Add quote reference column to configurations
alter table se_configurations add column if not exists quote_ref text;
create index if not exists se_configurations_quote_ref on se_configurations (quote_ref);
