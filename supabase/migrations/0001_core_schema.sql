-- ============================================================================
-- 0001_core_schema.sql
-- Moves the app's in-memory data (classes, sessions, payments, feed,
-- membership types) into persistent Postgres tables.
--
-- Money is stored as numeric dollars to match the existing UI; convert to
-- cents only at the Stripe boundary. Member references use uuid -> auth.users.
-- Numeric surrogate keys (bigint identity) match the app's current numeric ids.
-- Array fields (class signups, post likes) become join tables for clean RLS.
-- ============================================================================

-- Helper: is the current authenticated user the trainer?
create or replace function public.is_trainer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'trainer'
  );
$$;

-- ── Membership types ────────────────────────────────────────────────────────
-- id kept as text slug to match existing members.membership_type references.
create table if not exists public.membership_types (
  id               text primary key,
  name             text not null,
  price            numeric(10,2) not null default 0,
  classes_per_week integer not null default 1,
  duration_days    integer,
  stripe_price_id  text,            -- Stripe recurring price for subscriptions
  created_at       timestamptz not null default now()
);

-- Seed the three tiers currently hardcoded in AppState.
insert into public.membership_types (id, name, price, classes_per_week) values
  ('1x/week', '1x/Week', 29, 1),
  ('2x/week', '2x/Week', 49, 2),
  ('3x/week', '3x/Week', 79, 3)
on conflict (id) do nothing;

-- ── Classes ─────────────────────────────────────────────────────────────────
create table if not exists public.classes (
  id          bigint generated always as identity primary key,
  name        text not null,
  day         text not null,
  time        text not null,
  instructor  text not null default '',
  location    text not null default '',
  capacity    integer not null default 10,
  created_at  timestamptz not null default now()
);

-- Class signups (replaces the in-memory signups: string[] array)
create table if not exists public.class_signups (
  class_id   bigint not null references public.classes(id) on delete cascade,
  member_id  uuid not null references auth.users(id) on delete cascade,
  used_credit boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (class_id, member_id)
);

-- ── 1-on-1 personal sessions ────────────────────────────────────────────────
create table if not exists public.personal_sessions (
  id          bigint generated always as identity primary key,
  member_id   uuid not null references auth.users(id) on delete cascade,
  member_name text not null,
  date        date not null,
  time        text not null,
  duration    integer not null default 30,
  status      text not null default 'pending'
                check (status in ('pending','confirmed','cancelled')),
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

-- ── Payments ────────────────────────────────────────────────────────────────
-- Supports manual records (Cash/Zelle) and Stripe (one-time + subscription).
create table if not exists public.payments (
  id                       bigint generated always as identity primary key,
  member_id                uuid references auth.users(id) on delete set null,
  member_name              text not null,
  amount                   numeric(10,2) not null,
  method                   text not null
                             check (method in ('Cash','Zelle','Stripe')),
  reference                text not null default '',
  date                     date not null,
  membership_type_id       text references public.membership_types(id),
  type                     text not null default 'membership'
                             check (type in ('membership','credits','one_time')),
  stripe_payment_intent_id text,
  stripe_session_id        text,
  created_at               timestamptz not null default now()
);

-- ── Subscriptions (Stripe Billing for recurring memberships) ────────────────
create table if not exists public.subscriptions (
  id                     bigint generated always as identity primary key,
  member_id              uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  membership_type_id     text references public.membership_types(id),
  status                 text not null default 'incomplete',
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Track the Stripe customer on the member for reuse across checkouts.
alter table public.members
  add column if not exists stripe_customer_id text;

-- ── Trainer feed ────────────────────────────────────────────────────────────
create table if not exists public.feed_posts (
  id         bigint generated always as identity primary key,
  content    text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_comments (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.feed_posts(id) on delete cascade,
  member_id   uuid not null references auth.users(id) on delete cascade,
  member_name text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

-- Post likes (replaces the in-memory likes: string[] array)
create table if not exists public.feed_likes (
  post_id    bigint not null references public.feed_posts(id) on delete cascade,
  member_id  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, member_id)
);

-- ── Indexes for common lookups ──────────────────────────────────────────────
create index if not exists idx_class_signups_member  on public.class_signups(member_id);
create index if not exists idx_sessions_member        on public.personal_sessions(member_id);
create index if not exists idx_payments_member        on public.payments(member_id);
create index if not exists idx_subscriptions_member   on public.subscriptions(member_id);
create index if not exists idx_feed_comments_post     on public.feed_comments(post_id);
create index if not exists idx_feed_likes_post        on public.feed_likes(post_id);
