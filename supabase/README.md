# Supabase Portal Setup

This portal now supports a Supabase-backed account system with:

- Email/password authentication
- Per-user profiles
- Shared community profiles for enrolled students and instructors
- Per-user assignments and workbook storage
- Private file storage
- Row Level Security on every user-owned table

Each authenticated user is restricted to their own rows and their own storage
folder.

## 1. Create a Supabase project

Create a project in Supabase and keep these two values ready:

- Project URL
- Anon key

## 2. Run the SQL schema

Open the Supabase SQL editor and run:

- [portal-schema.sql](/Users/mikey/Desktop/Desktop%20Stuff/decision-lab/supabase/portal-schema.sql)

That will create:

- `course_enrollments`
- `profiles`
- `community_profiles`
- `user_assignments`
- `user_workbook_entries`
- `user_files`
- the private `portal-files` storage bucket
- the authenticated-read `community-profiles` image bucket
- RLS policies so users can only access their own records and files
- an auth trigger that blocks account creation unless the email has an approved
  course enrollment

Run the updated SQL again if your project was already set up before the
course enrollment gate or community profile feature was added. It is idempotent
and will add the missing enrollment table, shared-profile table, policies,
trigger, and storage bucket.

## 3. Approve course registrations before account creation

Course registrations now enter `course_enrollments` as `pending`. Open
`portal-approvals.html`, enter the admin key, choose `Student` or `Instructor`,
and approve or deny each request. The portal and the Supabase auth trigger both
check this table before account creation.

Payment is tracked separately from approval:

- `payment_status = unpaid` means the person has submitted Get Access but no
  Stripe payment has been recorded yet.
- `payment_status = paid` shows as a checkmark in the approval queue.
- `payment_status = waived` is available for manual/school/group exceptions.

The recommended workflow is: Get Access submission, Stripe payment, then admin
approval when the class/cohort is ready.

The default admin key is `4429`, matching Teacher Mode. To change it, run:

```sql
update public.portal_admin_settings
set admin_key_hash = crypt('NEW-KEY-HERE', gen_salt('bf'))
where id = true;
```

You can still add or approve a user manually from SQL when needed:

```sql
insert into public.course_enrollments (email, role, status, full_name)
values
  ('student@example.com', 'student', 'approved', 'Student Name'),
  ('teacher@example.com', 'instructor', 'approved', 'Instructor Name')
on conflict (email) do update
set role = excluded.role,
    status = excluded.status,
    full_name = excluded.full_name;
```

Use the same email address from the course registration form. Once an approved
person creates an account, the enrollment row is marked `used` and linked to
their auth user.

## 4. Auth settings

In Supabase Auth:

- Enable Email provider
- Decide whether email confirmation is required

If email confirmation is enabled, new users will need to confirm their email
before their first sign-in session is created.

## 5. Connect the portal

On the portal page, save:

- Supabase project URL
- Supabase anon key
- Storage bucket name

The default bucket name in the SQL is `portal-files`.

## 6. Shared identity visibility

This setup now has two visibility layers:

- students can only access their own information
- instructors can only access their own information
- enrolled users can view the shared `community_profiles` identity cards for
  other enrolled users

Private assignments, workbook entries, uploads, emails, and account-specific
records remain owner-only. The shared community layer is limited to the
displayed name, role, cohort, track, shared bio fields, and current profile
image.
