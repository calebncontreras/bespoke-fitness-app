-- ============================================================================
-- 0005_rls_existing_tables.sql
-- Enables Row Level Security on the pre-existing hand-created tables.
--
-- Until now these tables had RLS OFF, so any authenticated user could read/write
-- everything through the API — including all members' PII. This locks them down:
--   * Trainer (is_trainer()) keeps full access.
--   * Members read/write only their own rows; document templates are readable by
--     all authenticated users (members must see required docs).
--
-- is_trainer() is SECURITY DEFINER, so it bypasses RLS on profiles and does not
-- recurse when these policies evaluate.
--
-- Policies use DROP ... IF EXISTS first so this migration is safe to re-run.
-- ============================================================================

-- ── members ─────────────────────────────────────────────────────────────────
alter table public.members enable row level security;

drop policy if exists members_trainer_all on public.members;
drop policy if exists members_select_own on public.members;
drop policy if exists members_insert_own on public.members;
drop policy if exists members_update_own on public.members;

create policy members_trainer_all on public.members
  for all to authenticated using (is_trainer()) with check (is_trainer());
create policy members_select_own on public.members
  for select to authenticated using (id = auth.uid());
create policy members_insert_own on public.members
  for insert to authenticated with check (id = auth.uid());
create policy members_update_own on public.members
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ── profiles ────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists profiles_trainer_all on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;

create policy profiles_trainer_all on public.profiles
  for all to authenticated using (is_trainer()) with check (is_trainer());
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
-- Self-registration only — a client cannot make themselves a trainer.
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid() and role = 'member');

-- ── documents (templates): everyone reads, trainer writes ───────────────────
alter table public.documents enable row level security;

drop policy if exists documents_select on public.documents;
drop policy if exists documents_trainer_write on public.documents;

create policy documents_select on public.documents
  for select to authenticated using (true);
create policy documents_trainer_write on public.documents
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── member_documents: members manage their own, trainer all ─────────────────
alter table public.member_documents enable row level security;

drop policy if exists md_trainer_all on public.member_documents;
drop policy if exists md_select_own on public.member_documents;
drop policy if exists md_insert_own on public.member_documents;
drop policy if exists md_update_own on public.member_documents;

create policy md_trainer_all on public.member_documents
  for all to authenticated using (is_trainer()) with check (is_trainer());
create policy md_select_own on public.member_documents
  for select to authenticated using (member_id = auth.uid());
create policy md_insert_own on public.member_documents
  for insert to authenticated with check (member_id = auth.uid());
create policy md_update_own on public.member_documents
  for update to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());

-- Refresh PostgREST's cached schema.
notify pgrst, 'reload schema';
