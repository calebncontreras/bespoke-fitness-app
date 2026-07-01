-- ============================================================================
-- 0004_ensure_payments_type.sql
-- Fixes "Could not find the 'type' column of 'payments' in the schema cache".
-- Ensures payments.type exists (no-op if 0001 already created it) and forces
-- PostgREST to reload its cached schema so the column is visible to the API.
-- ============================================================================

alter table public.payments
  add column if not exists type text not null default 'membership';

-- Re-assert the allowed values (safe if the constraint already exists).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'payments_type_check') then
    alter table public.payments
      add constraint payments_type_check check (type in ('membership','credits','one_time'));
  end if;
end $$;

-- Force PostgREST to refresh its schema cache.
notify pgrst, 'reload schema';
