# Supabase Portal Setup

This portal now supports a Supabase-backed account system with:

- Email/password authentication
- Per-user profiles
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
- `user_assignments`
- `user_workbook_entries`
- `user_files`
- the private `portal-files` storage bucket
- RLS policies so users can only access their own records and files

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

## 5. Important note about instructor access

This setup is intentionally strict:

- students can only access their own information
- instructors can only access their own information

That matches the current RLS requirement for private per-user ownership.

If you later want instructors to review selected student data, that will need a
separate teacher-to-student relationship model and additional RLS policies.
