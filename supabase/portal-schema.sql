create extension if not exists pgcrypto;

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
create index if not exists idx_user_assignments_user_sort on public.user_assignments(user_id, sort_order);
create index if not exists idx_user_workbook_entries_user_sort on public.user_workbook_entries(user_id, sort_order);
create index if not exists idx_user_files_user_created on public.user_files(user_id, created_at desc);
create index if not exists idx_community_profiles_role_name on public.community_profiles(role, display_name);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

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
