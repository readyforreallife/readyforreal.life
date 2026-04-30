create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'student' check (role in ('student', 'instructor')),
  display_name text not null,
  cohort text not null default 'Ready for Real Life Cohort',
  track text not null default 'Core Skills Focus',
  avatar text not null default '🚀',
  welcome_title text not null default 'Welcome back.',
  welcome_copy text not null default '',
  bio_proud text not null default '',
  bio_goal text not null default '',
  bio_strengths text not null default '',
  bio_support text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  role text not null default 'student' check (role in ('student', 'instructor')),
  status text not null default 'pending',
  full_name text not null default '',
  cohort text not null default 'Ready for Real Life Cohort',
  track text not null default 'Core Skills Focus',
  notes text not null default '',
  user_id uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.course_enrollments
drop constraint if exists course_enrollments_status_check;

alter table public.course_enrollments
add constraint course_enrollments_status_check
check (status in ('pending', 'invited', 'approved', 'used', 'revoked'));

create table if not exists public.portal_admin_settings (
  id boolean primary key default true check (id),
  admin_key_hash text not null,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.portal_admin_settings (id, admin_key_hash)
values (true, extensions.crypt('4429', extensions.gen_salt('bf')))
on conflict (id) do nothing;

create table if not exists public.user_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_key text not null,
  title text not null,
  objective text not null,
  due_label text not null,
  rubric_focus text not null,
  submission text not null default '',
  ready_for_review boolean not null default false,
  review_status text not null default 'Not reviewed',
  review_score text not null default '',
  review_celebration text not null default '',
  review_coaching text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, assignment_key)
);

create table if not exists public.user_workbook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_key text not null,
  title text not null,
  prompt text not null,
  response text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, prompt_key)
);

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/octet-stream',
  file_size_bytes bigint not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'student' check (role in ('student', 'instructor')),
  cohort text not null default 'Ready for Real Life Cohort',
  track text not null default 'Core Skills Focus',
  avatar text not null default '🚀',
  profile_image_path text not null default '',
  bio_proud text not null default '',
  bio_goal text not null default '',
  bio_strengths text not null default '',
  bio_support text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_course_enrollments_email_status on public.course_enrollments(email, status);
create index if not exists idx_course_enrollments_status_updated on public.course_enrollments(status, updated_at desc);
create index if not exists idx_user_assignments_user_sort on public.user_assignments(user_id, sort_order);
create index if not exists idx_user_workbook_entries_user_sort on public.user_workbook_entries(user_id, sort_order);
create index if not exists idx_user_files_user_created on public.user_files(user_id, created_at desc);
create index if not exists idx_community_profiles_role_name on public.community_profiles(role, display_name);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;
create trigger set_course_enrollments_updated_at
before update on public.course_enrollments
for each row
execute function public.set_updated_at();

drop trigger if exists set_portal_admin_settings_updated_at on public.portal_admin_settings;
create trigger set_portal_admin_settings_updated_at
before update on public.portal_admin_settings
for each row
execute function public.set_updated_at();

create or replace function public.can_create_portal_account(
  account_email text,
  requested_role text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.course_enrollments enrollment
    where enrollment.email = nullif(trim(account_email), '')::citext
      and enrollment.status in ('invited', 'approved')
      and (
        requested_role is null
        or requested_role = ''
        or enrollment.role = requested_role
      )
  );
$$;

grant execute on function public.can_create_portal_account(text, text) to anon, authenticated;

create or replace function public.portal_admin_key_matches(admin_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.portal_admin_settings settings
    where settings.id = true
      and settings.admin_key_hash = extensions.crypt(coalesce(admin_key, ''), settings.admin_key_hash)
  );
$$;

grant execute on function public.portal_admin_key_matches(text) to anon, authenticated;

create or replace function public.submit_course_registration(
  account_email text,
  full_name text,
  requested_role text default 'student',
  registration_notes text default '',
  requested_cohort text default 'Ready for Real Life Cohort',
  requested_track text default 'Core Skills Focus'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email citext;
  normalized_role text;
  enrollment public.course_enrollments%rowtype;
begin
  normalized_email := nullif(trim(account_email), '')::citext;
  normalized_role := case
    when requested_role = 'instructor' then 'instructor'
    else 'student'
  end;

  if normalized_email is null then
    raise exception 'Email is required.' using errcode = 'P0001';
  end if;

  insert into public.course_enrollments (
    email,
    role,
    status,
    full_name,
    cohort,
    track,
    notes
  )
  values (
    normalized_email,
    normalized_role,
    'pending',
    trim(coalesce(full_name, '')),
    coalesce(nullif(trim(requested_cohort), ''), 'Ready for Real Life Cohort'),
    coalesce(nullif(trim(requested_track), ''), 'Core Skills Focus'),
    trim(coalesce(registration_notes, ''))
  )
  on conflict (email) do update
  set role = case
        when public.course_enrollments.status = 'used' then public.course_enrollments.role
        else excluded.role
      end,
      status = case
        when public.course_enrollments.status in ('approved', 'used') then public.course_enrollments.status
        else 'pending'
      end,
      full_name = excluded.full_name,
      cohort = excluded.cohort,
      track = excluded.track,
      notes = excluded.notes,
      updated_at = timezone('utc', now())
  returning * into enrollment;

  return jsonb_build_object(
    'ok', true,
    'id', enrollment.id,
    'email', enrollment.email::text,
    'status', enrollment.status,
    'role', enrollment.role
  );
end;
$$;

grant execute on function public.submit_course_registration(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.list_course_enrollments_for_admin(
  admin_key text,
  enrollment_status text default 'pending'
)
returns table (
  id uuid,
  email text,
  role text,
  status text,
  full_name text,
  cohort text,
  track text,
  notes text,
  user_id uuid,
  used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.portal_admin_key_matches(admin_key) then
    raise exception 'Admin key did not match.' using errcode = 'P0001';
  end if;

  return query
  select
    enrollment.id,
    enrollment.email::text,
    enrollment.role,
    enrollment.status,
    enrollment.full_name,
    enrollment.cohort,
    enrollment.track,
    enrollment.notes,
    enrollment.user_id,
    enrollment.used_at,
    enrollment.created_at,
    enrollment.updated_at
  from public.course_enrollments enrollment
  where enrollment_status is null
    or enrollment_status = ''
    or enrollment.status = enrollment_status
  order by enrollment.updated_at desc, enrollment.created_at desc;
end;
$$;

grant execute on function public.list_course_enrollments_for_admin(text, text) to anon, authenticated;

create or replace function public.review_course_enrollment(
  admin_key text,
  enrollment_id uuid,
  next_status text,
  next_role text default null,
  admin_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  enrollment public.course_enrollments%rowtype;
  normalized_status text;
  normalized_role text;
begin
  if not public.portal_admin_key_matches(admin_key) then
    raise exception 'Admin key did not match.' using errcode = 'P0001';
  end if;

  normalized_status := case
    when next_status in ('pending', 'invited', 'approved', 'revoked') then next_status
    else null
  end;

  if normalized_status is null then
    raise exception 'Review status must be pending, invited, approved, or revoked.'
      using errcode = 'P0001';
  end if;

  normalized_role := case
    when next_role = 'instructor' then 'instructor'
    when next_role = 'student' then 'student'
    else null
  end;

  update public.course_enrollments
  set status = normalized_status,
      role = coalesce(normalized_role, role),
      notes = coalesce(admin_notes, notes),
      updated_at = timezone('utc', now())
  where id = enrollment_id
    and status <> 'used'
  returning * into enrollment;

  if enrollment.id is null then
    raise exception 'Enrollment was not found or has already been used.'
      using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'ok', true,
    'id', enrollment.id,
    'email', enrollment.email::text,
    'status', enrollment.status,
    'role', enrollment.role
  );
end;
$$;

grant execute on function public.review_course_enrollment(text, uuid, text, text, text) to anon, authenticated;

create or replace function public.delete_own_portal_account()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  target_email text;
begin
  target_user_id := auth.uid();

  if target_user_id is null then
    raise exception 'Sign in before deleting your account.'
      using errcode = 'P0001';
  end if;

  select email
  into target_email
  from auth.users
  where id = target_user_id;

  delete from storage.objects
  where bucket_id in ('portal-files', 'community-profiles')
    and (storage.foldername(name))[1] = target_user_id::text;

  update public.course_enrollments
  set status = 'revoked',
      user_id = null,
      used_at = null,
      updated_at = timezone('utc', now())
  where user_id = target_user_id;

  delete from auth.users
  where id = target_user_id;

  return jsonb_build_object(
    'ok', true,
    'user_id', target_user_id,
    'email', target_email
  );
end;
$$;

grant execute on function public.delete_own_portal_account() to authenticated;

create or replace function public.admin_delete_portal_account(
  admin_key text,
  enrollment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  enrollment public.course_enrollments%rowtype;
begin
  if not public.portal_admin_key_matches(admin_key) then
    raise exception 'Admin key did not match.' using errcode = 'P0001';
  end if;

  select *
  into enrollment
  from public.course_enrollments
  where id = enrollment_id;

  if enrollment.id is null then
    raise exception 'Enrollment was not found.' using errcode = 'P0001';
  end if;

  if enrollment.user_id is null then
    raise exception 'This enrollment does not have a linked portal account.'
      using errcode = 'P0001';
  end if;

  delete from storage.objects
  where bucket_id in ('portal-files', 'community-profiles')
    and (storage.foldername(name))[1] = enrollment.user_id::text;

  update public.course_enrollments
  set status = 'revoked',
      user_id = null,
      used_at = null,
      updated_at = timezone('utc', now())
  where id = enrollment.id;

  delete from auth.users
  where id = enrollment.user_id;

  return jsonb_build_object(
    'ok', true,
    'id', enrollment.id,
    'email', enrollment.email::text,
    'deleted_user_id', enrollment.user_id
  );
end;
$$;

grant execute on function public.admin_delete_portal_account(text, uuid) to anon, authenticated;

create or replace function public.enforce_course_enrollment_after_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  approved_enrollment public.course_enrollments%rowtype;
begin
  requested_role := coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'student');

  select *
  into approved_enrollment
  from public.course_enrollments enrollment
  where enrollment.email = new.email::citext
    and enrollment.status in ('invited', 'approved')
  order by enrollment.created_at desc
  limit 1;

  if approved_enrollment.id is null then
    raise exception 'Course registration is required before creating a portal account.'
      using errcode = 'P0001';
  end if;

  if approved_enrollment.role <> requested_role then
    raise exception 'This course registration is not approved for the selected portal role.'
      using errcode = 'P0001';
  end if;

  update public.course_enrollments
  set status = 'used',
      user_id = new.id,
      used_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = approved_enrollment.id;

  return new;
end;
$$;

drop trigger if exists require_course_enrollment_before_signup on auth.users;
create trigger require_course_enrollment_before_signup
after insert on auth.users
for each row
execute function public.enforce_course_enrollment_after_signup();

drop function if exists public.enforce_course_enrollment_before_signup();

drop trigger if exists set_user_assignments_updated_at on public.user_assignments;
create trigger set_user_assignments_updated_at
before update on public.user_assignments
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_workbook_entries_updated_at on public.user_workbook_entries;
create trigger set_user_workbook_entries_updated_at
before update on public.user_workbook_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_user_files_updated_at on public.user_files;
create trigger set_user_files_updated_at
before update on public.user_files
for each row
execute function public.set_updated_at();

drop trigger if exists set_community_profiles_updated_at on public.community_profiles;
create trigger set_community_profiles_updated_at
before update on public.community_profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.portal_admin_settings enable row level security;
alter table public.user_assignments enable row level security;
alter table public.user_workbook_entries enable row level security;
alter table public.user_files enable row level security;
alter table public.community_profiles enable row level security;

drop policy if exists "Profiles are private to their owner" on public.profiles;
create policy "Profiles are private to their owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles can be inserted by their owner" on public.profiles;
create policy "Profiles can be inserted by their owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles can be updated by their owner" on public.profiles;
create policy "Profiles can be updated by their owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles can be deleted by their owner" on public.profiles;
create policy "Profiles can be deleted by their owner"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "Course enrollments are managed server-side" on public.course_enrollments;
create policy "Course enrollments are managed server-side"
on public.course_enrollments
for select
to authenticated
using (false);

drop policy if exists "Portal admin settings are managed server-side" on public.portal_admin_settings;
create policy "Portal admin settings are managed server-side"
on public.portal_admin_settings
for select
to authenticated
using (false);

drop policy if exists "Assignments are private to their owner" on public.user_assignments;
create policy "Assignments are private to their owner"
on public.user_assignments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Assignments can be inserted by their owner" on public.user_assignments;
create policy "Assignments can be inserted by their owner"
on public.user_assignments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Assignments can be updated by their owner" on public.user_assignments;
create policy "Assignments can be updated by their owner"
on public.user_assignments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Assignments can be deleted by their owner" on public.user_assignments;
create policy "Assignments can be deleted by their owner"
on public.user_assignments
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Workbook entries are private to their owner" on public.user_workbook_entries;
create policy "Workbook entries are private to their owner"
on public.user_workbook_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Workbook entries can be inserted by their owner" on public.user_workbook_entries;
create policy "Workbook entries can be inserted by their owner"
on public.user_workbook_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Workbook entries can be updated by their owner" on public.user_workbook_entries;
create policy "Workbook entries can be updated by their owner"
on public.user_workbook_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Workbook entries can be deleted by their owner" on public.user_workbook_entries;
create policy "Workbook entries can be deleted by their owner"
on public.user_workbook_entries
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Files are private to their owner" on public.user_files;
create policy "Files are private to their owner"
on public.user_files
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Files can be inserted by their owner" on public.user_files;
create policy "Files can be inserted by their owner"
on public.user_files
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Files can be updated by their owner" on public.user_files;
create policy "Files can be updated by their owner"
on public.user_files
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Files can be deleted by their owner" on public.user_files;
create policy "Files can be deleted by their owner"
on public.user_files
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Community profiles are visible to enrolled users" on public.community_profiles;
create policy "Community profiles are visible to enrolled users"
on public.community_profiles
for select
to authenticated
using (true);

drop policy if exists "Community profiles can be inserted by their owner" on public.community_profiles;
create policy "Community profiles can be inserted by their owner"
on public.community_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Community profiles can be updated by their owner" on public.community_profiles;
create policy "Community profiles can be updated by their owner"
on public.community_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Community profiles can be deleted by their owner" on public.community_profiles;
create policy "Community profiles can be deleted by their owner"
on public.community_profiles
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('portal-files', 'portal-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('community-profiles', 'community-profiles', false)
on conflict (id) do nothing;

drop policy if exists "Users can view their own portal files" on storage.objects;
create policy "Users can view their own portal files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their own portal files" on storage.objects;
create policy "Users can upload their own portal files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own portal files" on storage.objects;
create policy "Users can update their own portal files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own portal files" on storage.objects;
create policy "Users can delete their own portal files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portal-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can view community profile images" on storage.objects;
create policy "Authenticated users can view community profile images"
on storage.objects
for select
to authenticated
using (bucket_id = 'community-profiles');

drop policy if exists "Users can upload their own community profile image" on storage.objects;
create policy "Users can upload their own community profile image"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own community profile image" on storage.objects;
create policy "Users can update their own community profile image"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'community-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'community-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own community profile image" on storage.objects;
create policy "Users can delete their own community profile image"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'community-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);
