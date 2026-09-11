-- Additive migration. Run in Supabase SQL editor as administrator.
-- Never rely on public.profiles.role or the browser Teacher Mode PIN.
create table if not exists public.safety_staff (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','instructor')),
 enabled boolean not null default true
);
alter table public.safety_staff enable row level security;
revoke all on public.safety_staff from anon, authenticated;
grant select,insert,update,delete on public.safety_staff to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('safety-operations','safety-operations',false,20971520,array['application/zip','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
 ('safety-client-uploads','safety-client-uploads',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No anon/authenticated object policies are added. Downloads pass through the authenticated backend.
-- Confirm other pre-existing storage policies do not broadly grant access to these buckets.
-- Assign REAL, verified existing owner/instructor auth.users UUIDs using administrative SQL:
-- insert into public.safety_staff(user_id,role) values ('ACTUAL_EXISTING_AUTH_USER_UUID','owner');
-- Do not grant clients, students or all instructors access automatically.

-- Restrictive guard: even another permissive storage policy cannot expose Safety objects.
-- service_role bypasses RLS; only the authenticated Safety backend uses that credential.
drop policy if exists "Safety objects require backend authorization" on storage.objects;
create policy "Safety objects require backend authorization"
on storage.objects as restrictive for all to anon, authenticated
using (bucket_id not in ('safety-operations', 'safety-client-uploads'))
with check (bucket_id not in ('safety-operations', 'safety-client-uploads'));

drop policy if exists "Safety staff cannot self-authorize" on public.safety_staff;
create policy "Safety staff cannot self-authorize"
on public.safety_staff as restrictive for all to anon, authenticated
using (false) with check (false);
