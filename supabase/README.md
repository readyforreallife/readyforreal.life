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

- `profiles`
- `community_profiles`
- `user_assignments`
- `user_workbook_entries`
- `user_files`
- the private `portal-files` storage bucket
- the authenticated-read `community-profiles` image bucket
- RLS policies so users can only access their own records and files

Run the updated SQL again if your project was already set up before the
community profile feature was added. It is idempotent and will add the missing
shared-profile table, policies, and storage bucket.

## 3. Auth settings

In Supabase Auth:

- Enable Email provider
- Decide whether email confirmation is required

If email confirmation is enabled, new users will need to confirm their email
before their first sign-in session is created.

## 4. Connect the portal

On the portal page, save:

- Supabase project URL
- Supabase anon key
- Storage bucket name

The default bucket name in the SQL is `portal-files`.

## 5. Shared identity visibility

This setup now has two visibility layers:

- students can only access their own information
- instructors can only access their own information
- enrolled users can view the shared `community_profiles` identity cards for
  other enrolled users

Private assignments, workbook entries, uploads, emails, and account-specific
records remain owner-only. The shared community layer is limited to the
displayed name, role, cohort, track, shared bio fields, and current profile
image.
