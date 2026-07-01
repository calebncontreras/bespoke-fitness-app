-- ============================================================================
-- 0006_session_pack_fields.sql
-- Extends session_packs with the breakdown behind the (auto-calculated) price:
-- price per session, session duration (minutes), and an optional sales-tax rate.
-- `price` remains the pack total used at checkout.
-- ============================================================================

alter table public.session_packs
  add column if not exists price_per_session numeric(10,2),
  add column if not exists session_duration  integer,
  add column if not exists sales_tax          numeric(5,2);  -- percentage rate; null = none

notify pgrst, 'reload schema';
