create schema if not exists private;

create or replace function private.current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role::text
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

create or replace function private.current_gym_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.gym_id
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

create or replace function private.is_management()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    private.current_role() in ('owner', 'admin'),
    false
  );
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;

revoke all on function private.current_role() from public;
revoke all on function private.current_gym_id() from public;
revoke all on function private.is_management() from public;

grant execute on function private.current_role() to authenticated;
grant execute on function private.current_gym_id() to authenticated;
grant execute on function private.is_management() to authenticated;