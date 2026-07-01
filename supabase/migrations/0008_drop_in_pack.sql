-- ============================================================================
-- 0008_drop_in_pack.sql
-- Adds the $50 single-session drop-in as a session pack (1 credit, 60 min).
-- Guarded by name so re-running won't create duplicates (session_packs has an
-- auto-generated id, so there's no natural conflict target for upsert).
-- ============================================================================

insert into public.session_packs (name, price, credits, price_per_session, session_duration, sales_tax)
select 'Drop-In', 50, 1, 50, 60, null
where not exists (select 1 from public.session_packs where name = 'Drop-In');

notify pgrst, 'reload schema';
