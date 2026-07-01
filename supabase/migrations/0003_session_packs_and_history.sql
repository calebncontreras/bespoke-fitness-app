-- ============================================================================
-- 0003_session_packs_and_history.sql
-- Adds trainer-configurable session packs (bundles of class credits) and a
-- per-member membership/purchase history stored on the members row.
-- ============================================================================

-- ── Session packs (bundles of class credits) ────────────────────────────────
create table if not exists public.session_packs (
  id         bigint generated always as identity primary key,
  name       text not null,
  price      numeric(10,2) not null default 0,
  credits    integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.session_packs enable row level security;

create policy session_packs_select on public.session_packs
  for select to authenticated using (true);
create policy session_packs_write on public.session_packs
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── Per-member purchase history (memberships + packs) ───────────────────────
-- Each entry: { type, productId, productName, amount, date, newExpiry?, creditsAdded? }
alter table public.members
  add column if not exists membership_history jsonb not null default '[]'::jsonb;
