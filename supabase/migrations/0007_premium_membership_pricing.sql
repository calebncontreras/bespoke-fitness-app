-- ============================================================================
-- 0007_premium_membership_pricing.sql
-- Sets the Classes membership tiers to the agreed premium pricing and adds an
-- Unlimited tier. Prices are the monthly membership price (what a member pays
-- at checkout). classes_per_week = 999 renders as "Unlimited" in the UI.
-- Idempotent: upserts by id, so it's safe to re-run and overrides the seeded
-- placeholder prices from 0001.
-- ============================================================================

insert into public.membership_types (id, name, price, classes_per_week) values
  ('1x/week',   '1x/Week',   189, 1),
  ('2x/week',   '2x/Week',   349, 2),
  ('3x/week',   '3x/Week',   479, 3),
  ('unlimited', 'Unlimited', 529, 999)
on conflict (id) do update
  set name             = excluded.name,
      price            = excluded.price,
      classes_per_week = excluded.classes_per_week;

notify pgrst, 'reload schema';
