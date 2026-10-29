-- EVIQ driver reports. Run once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Only the server writes and reads this table, using the service-role key (which bypasses RLS).
-- RLS is enabled with no policies, so the public anon key can do nothing with it.

create extension if not exists pgcrypto;

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  station_id  text not null check (station_id ~ '^(ocm:[0-9]{1,10}|osm:[nwr][0-9]{1,15})$'),
  status      text not null check (status in ('working', 'broken', 'busy')),
  client_hash text not null check (char_length(client_hash) = 64),
  created_at  timestamptz not null default now()
);

-- Reading recent reports for a set of stations.
create index if not exists reports_station_created_idx
  on public.reports (station_id, created_at desc);

-- Cooldown lookup: has this client reported this station recently?
create index if not exists reports_cooldown_idx
  on public.reports (station_id, client_hash, created_at desc);

alter table public.reports enable row level security;
-- Intentionally no policies. Revoke direct table access from the public API roles as well.
revoke all on public.reports from anon, authenticated;

-- Optional housekeeping: the app ignores reports older than 72 hours. To keep the table small,
-- delete old rows on a schedule (Dashboard -> Integrations -> Cron, or pg_cron):
--   delete from public.reports where created_at < now() - interval '30 days';

-- ---------------------------------------------------------------------------------------------
-- Privacy-friendly product metrics: one counter per (day, event name). No identifiers.
-- Written through the increment_metric function by the server (service role) only.
create table if not exists public.metrics (
  day   date   not null,
  name  text   not null check (name ~ '^[a-z_]{1,40}$'),
  count bigint not null default 0,
  primary key (day, name)
);

alter table public.metrics enable row level security;
revoke all on public.metrics from anon, authenticated;

create or replace function public.increment_metric(p_name text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.metrics (day, name, count)
  values ((now() at time zone 'utc')::date, p_name, 1)
  on conflict (day, name) do update set count = public.metrics.count + 1;
$$;

revoke all on function public.increment_metric(text) from public, anon, authenticated;
grant execute on function public.increment_metric(text) to service_role;
