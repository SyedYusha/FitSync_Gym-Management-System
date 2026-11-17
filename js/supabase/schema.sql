
create extension if not exists pgcrypto;

create type public.app_role as enum (
  'owner',
  'admin',
  'trainer',
  'member'
);

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id)
    on delete cascade,
  gym_id uuid not null references public.gyms(id),
  full_name text not null,
  role public.app_role not null,
  created_at timestamptz default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  profile_id uuid unique references public.profiles(id),
  full_name text not null,
  email text,
  phone text,
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  name text not null,
  duration_days integer not null
    check (duration_days > 0),
  price numeric(12,2) not null
    check (price >= 0),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  member_id uuid not null references public.members(id),
  plan_id uuid not null references public.plans(id),
  start_date date not null,
  end_date date not null,
  status text not null default 'active'
    check (status in ('active','expired','cancelled')),
  created_at timestamptz default now(),
  check (end_date >= start_date)
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  profile_id uuid unique not null references public.profiles(id),
  created_at timestamptz default now()
);

create table public.trainer_assignments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  trainer_id uuid not null references public.trainers(id),
  member_id uuid not null references public.members(id),
  unique (trainer_id, member_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  member_id uuid not null references public.members(id),
  marked_by uuid not null references public.profiles(id),
  attendance_date date not null default current_date,
  check_in timestamptz default now(),
  status text not null default 'present'
    check (status in ('present','absent')),
  unique (member_id, attendance_date)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  member_id uuid not null references public.members(id),
  membership_id uuid references public.memberships(id),
  amount numeric(12,2) not null check (amount > 0),
  method text not null
    check (method in ('cash','card','bank','other')),
  status text not null default 'paid'
    check (status in ('paid','pending','failed','refunded')),
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  recipient_id uuid references public.profiles(id),
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz default now()
);

create index members_gym_idx
  on public.members(gym_id);

create index memberships_member_idx
  on public.memberships(member_id);

create index attendance_member_date_idx
  on public.attendance(member_id, attendance_date);

create index payments_member_idx
  on public.payments(member_id);

create index profiles_gym_role_idx
  on public.profiles(gym_id, role);
