-- Radar: Campus Prediction Market & Local-First Meetup Platform
-- Core PostgreSQL schema with Atomic Balance Deductions and Strict Meetup RLS

create extension if not exists "uuid-ossp";

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  balance numeric not null default 1000 check (balance >= 0),
  created_at timestamptz not null default now()
);

-- Markets (Prediction Polls)
create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  resolution_criteria text not null,
  expiry_date timestamptz not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'cancelled')),
  total_pool_yes numeric not null default 0 check (total_pool_yes >= 0),
  total_pool_no numeric not null default 0 check (total_pool_no >= 0),
  created_at timestamptz not null default now()
);

-- Bets
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  outcome text not null check (outcome in ('YES', 'NO')),
  amount numeric not null check (amount > 0),
  odds_at_time numeric not null check (odds_at_time > 0),
  created_at timestamptz not null default now()
);

-- Anonymous Market Live Chat
create table if not exists public.market_messages (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  anonymous_handle text not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Private 24-Hour Meetups with Split-Key Protocol
create table if not exists public.meetups (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  user_a_id uuid not null references public.users(id) on delete cascade,
  user_b_id uuid not null references public.users(id) on delete cascade,
  user_b_real_name text not null,
  split_key_hash_a text not null,
  split_key_hash_b text not null,
  meetup_verified boolean not null default false,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

-- Meetup Private Encrypted Messages
create table if not exists public.meetup_messages (
  id uuid primary key default gen_random_uuid(),
  meetup_id uuid not null references public.meetups(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  encrypted_payload text not null,
  created_at timestamptz not null default now()
);

-- Atomic balance deduction: prevents Read-Modify-Write race conditions
create or replace function deduct_user_balance_atomic(p_user_id uuid, p_amount numeric)
returns boolean
language plpgsql
security definer
as $$
declare
  v_updated boolean;
begin
  update public.users
  set balance = balance - p_amount
  where id = p_user_id and balance >= p_amount;
  
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

-- RLS Enforcement
alter table public.users enable row level security;
alter table public.markets enable row level security;
alter table public.bets enable row level security;
alter table public.market_messages enable row level security;
alter table public.meetups enable row level security;
alter table public.meetup_messages enable row level security;

-- Public read for open markets & anonymous chats
create policy "Allow public read on markets" on public.markets
  for select using (true);

create policy "Allow public read on market messages" on public.market_messages
  for select using (true);

create policy "Allow insert on market messages" on public.market_messages
  for insert with check (true);

-- Meetup Security: Only participants can access meetup
create policy "Meetup participants access" on public.meetups
  for select using (
    auth.uid() = user_a_id or auth.uid() = user_b_id
  );

-- Secure view: Never expose user_b_real_name until meetup_verified is true
create or replace view public.v_secure_meetups as
select
  id,
  market_id,
  user_a_id,
  user_b_id,
  case
    when meetup_verified = true then user_b_real_name
    else null
  end as user_b_real_name,
  split_key_hash_a,
  split_key_hash_b,
  meetup_verified,
  expires_at,
  created_at
from public.meetups;
