/*
# Create attendance and admin access schema

1. New Tables
- `attendance`: one row per person who signs in.
  - `id` (uuid, primary key)
  - `full_name` (text, required, 2 to 100 characters)
  - `phone_number` (text, required, 7 to 20 characters of digits, spaces, +, - or parentheses)
  - `reg_number` (text, required, 12 digits followed by 2 letters, e.g. 202660623441GA)
  - `created_at` (timestamp, defaults to now)
- `admins`: email addresses allowed to view and export the attendance list.
  - `email` (text, primary key, stored lowercase)

2. New Functions
- `is_admin()`: returns true when the signed-in user's email is in the `admins` table. Runs with owner rights so the admin list itself stays hidden from everyone else.

3. Security
- Row level security enabled on both tables.
- Anyone (including visitors who are not signed in) can submit an attendance record.
- Only signed-in admins can read or delete attendance records. No one can edit records.
- `admins` is not reachable through the Data API at all.
- `is_admin()` can only be called by signed-in users.

4. Important Notes
- Format checks are enforced in the database as well as in the form.
- Admin accounts are added by inserting their email into `admins`.
*/

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100),
  phone_number text NOT NULL CHECK (phone_number ~ '^[0-9+()\- ]{7,20}$' AND char_length(regexp_replace(phone_number, '[^0-9]', '', 'g')) BETWEEN 7 AND 15),
  reg_number text NOT NULL CHECK (reg_number ~ '^[0-9]{12}[A-Z]{2}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_created_at_idx ON attendance (created_at DESC);

CREATE TABLE IF NOT EXISTS admins (
  email text PRIMARY KEY CHECK (email = lower(email))
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.email = lower(auth.jwt() ->> 'email')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

GRANT INSERT ON attendance TO anon, authenticated;
GRANT SELECT, DELETE ON attendance TO authenticated;

DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_attendance" ON attendance;
CREATE POLICY "admin_select_attendance" ON attendance FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_attendance" ON attendance;
CREATE POLICY "admin_delete_attendance" ON attendance FOR DELETE
  TO authenticated USING (public.is_admin());
