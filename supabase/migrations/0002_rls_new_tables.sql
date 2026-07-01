-- ============================================================================
-- 0002_rls_new_tables.sql
-- Row Level Security for the tables created in 0001.
--
-- Model:
--   * Trainer (is_trainer()) has full access everywhere.
--   * Members read shared data (classes, membership types, feed) and write
--     only their own rows (signups, sessions, comments, likes).
--   * Payments/subscriptions are written by the Stripe webhook via the service
--     role key, which bypasses RLS entirely.
--
-- NOTE: class_signups currently allows any authenticated user to SELECT so the
-- UI can compute available spots. If member-to-member privacy becomes a
-- concern, replace this with a trigger-maintained signups_count on classes.
-- ============================================================================

-- ── membership_types: everyone reads, trainer writes ───────────────────────
alter table public.membership_types enable row level security;

create policy membership_types_select on public.membership_types
  for select to authenticated using (true);
create policy membership_types_write on public.membership_types
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── classes: everyone reads, trainer writes ────────────────────────────────
alter table public.classes enable row level security;

create policy classes_select on public.classes
  for select to authenticated using (true);
create policy classes_write on public.classes
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── class_signups: members manage their own, trainer all ───────────────────
alter table public.class_signups enable row level security;

create policy class_signups_select on public.class_signups
  for select to authenticated using (true);
create policy class_signups_insert_own on public.class_signups
  for insert to authenticated with check (member_id = auth.uid());
create policy class_signups_delete_own on public.class_signups
  for delete to authenticated using (member_id = auth.uid());
create policy class_signups_trainer_all on public.class_signups
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── personal_sessions: members manage their own, trainer all ───────────────
alter table public.personal_sessions enable row level security;

create policy sessions_select_own on public.personal_sessions
  for select to authenticated using (member_id = auth.uid() or is_trainer());
create policy sessions_insert_own on public.personal_sessions
  for insert to authenticated with check (member_id = auth.uid());
create policy sessions_update_own on public.personal_sessions
  for update to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());
create policy sessions_trainer_all on public.personal_sessions
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── payments: members read their own, trainer all (webhook = service role) ─
alter table public.payments enable row level security;

create policy payments_select_own on public.payments
  for select to authenticated using (member_id = auth.uid() or is_trainer());
create policy payments_trainer_all on public.payments
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── subscriptions: members read their own, trainer all ─────────────────────
alter table public.subscriptions enable row level security;

create policy subscriptions_select_own on public.subscriptions
  for select to authenticated using (member_id = auth.uid() or is_trainer());
create policy subscriptions_trainer_all on public.subscriptions
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── feed_posts: everyone reads, trainer writes ─────────────────────────────
alter table public.feed_posts enable row level security;

create policy feed_posts_select on public.feed_posts
  for select to authenticated using (true);
create policy feed_posts_write on public.feed_posts
  for all to authenticated using (is_trainer()) with check (is_trainer());

-- ── feed_comments: everyone reads, members write their own, trainer all ────
alter table public.feed_comments enable row level security;

create policy feed_comments_select on public.feed_comments
  for select to authenticated using (true);
create policy feed_comments_insert_own on public.feed_comments
  for insert to authenticated with check (member_id = auth.uid());
create policy feed_comments_delete on public.feed_comments
  for delete to authenticated using (member_id = auth.uid() or is_trainer());

-- ── feed_likes: everyone reads, members manage their own ───────────────────
alter table public.feed_likes enable row level security;

create policy feed_likes_select on public.feed_likes
  for select to authenticated using (true);
create policy feed_likes_insert_own on public.feed_likes
  for insert to authenticated with check (member_id = auth.uid());
create policy feed_likes_delete_own on public.feed_likes
  for delete to authenticated using (member_id = auth.uid());
