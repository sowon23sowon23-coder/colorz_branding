create extension if not exists pgcrypto;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  school text,
  grade text,
  first_joined_at date,
  referral_code text unique,
  notes text,
  joined_by_referral boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  location text,
  topic text,
  entry_fee integer not null default 0,
  discount_policy text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists participations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  applied_status boolean not null default true,
  attended_status text not null default 'Applied' check (attended_status in ('Applied', 'Attended', 'No-show')),
  satisfaction_score integer check (satisfaction_score between 1 and 5),
  feedback text,
  discount_applied boolean not null default false,
  final_price_paid integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_participant_id uuid not null references participants(id) on delete cascade,
  referred_participant_id uuid not null references participants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  referral_status text not null check (referral_status in ('Pending', 'Approved', 'Reward issued', 'Reward used')),
  reward_type text,
  reward_issued boolean not null default false,
  reward_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) on delete cascade,
  referral_id uuid references referrals(id) on delete set null,
  reward_type text not null,
  reward_status text not null check (reward_status in ('Available', 'Issued', 'Used', 'Expired')),
  issued_at timestamptz,
  used_at timestamptz,
  related_event_id uuid references events(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists import_history (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  import_type text not null check (import_type in ('participants', 'participations', 'referrals')),
  imported_at timestamptz not null default now(),
  status text not null check (status in ('Completed', 'Completed with warnings', 'Failed')),
  rows integer not null default 0,
  created integer not null default 0,
  updated integer not null default 0,
  warnings integer not null default 0
);

alter table participants enable row level security;
alter table events enable row level security;
alter table participations enable row level security;
alter table referrals enable row level security;
alter table rewards enable row level security;
alter table import_history enable row level security;

create policy "Allow all operations for anon and authenticated users on participants" on participants
  for all to anon, authenticated using (true) with check (true);
create policy "Allow all operations for anon and authenticated users on events" on events
  for all to anon, authenticated using (true) with check (true);
create policy "Allow all operations for anon and authenticated users on participations" on participations
  for all to anon, authenticated using (true) with check (true);
create policy "Allow all operations for anon and authenticated users on referrals" on referrals
  for all to anon, authenticated using (true) with check (true);
create policy "Allow all operations for anon and authenticated users on rewards" on rewards
  for all to anon, authenticated using (true) with check (true);
create policy "Allow all operations for anon and authenticated users on import_history" on import_history
  for all to anon, authenticated using (true) with check (true);
