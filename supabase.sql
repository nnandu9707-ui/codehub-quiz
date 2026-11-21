-- CODEHUB v2 database setup
-- Run the entire script in Supabase Dashboard > SQL Editor > New query.
-- This creates profiles, quiz scores, a public leaderboard view and basic RLS policies.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('c','java','python','dbms','aptitude','premium')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.scores enable row level security;

-- Create a profile automatically when a new Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''), split_part(new.email,'@',1), 'Student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- A user can read only their own profile. The public leaderboard view exposes display names and scores only.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Do not create client-side UPDATE policy for profiles. Only the site owner/admin should grant Premium
-- from the Supabase SQL Editor after independently verifying a payment.

drop policy if exists "Users can insert own scores" on public.scores;
create policy "Users can insert own scores"
  on public.scores for insert
  to authenticated
  with check (auth.uid() = user_id);

-- The view exposes only safe public leaderboard fields, not email addresses or user IDs.
-- It uses the view owner's permissions so visitors can read the safe projection without
-- receiving direct SELECT access to the underlying scores/profiles tables.
create or replace view public.leaderboard
as
select
  p.display_name,
  s.category,
  s.score,
  s.total,
  s.created_at
from public.scores s
join public.profiles p on p.id = s.user_id
order by (s.score::numeric / s.total::numeric) desc, s.created_at asc;

grant select on public.leaderboard to anon, authenticated;
grant insert on public.scores to authenticated;

-- Owner/admin manual Premium activation:
-- 1. In Supabase Dashboard > Authentication > Users, copy the student's UUID.
-- 2. Run this query in SQL Editor after confirming payment outside the website:
-- update public.profiles set is_premium = true where id = 'PASTE-STUDENT-UUID-HERE';
--
-- To revoke:
-- update public.profiles set is_premium = false where id = 'PASTE-STUDENT-UUID-HERE';
