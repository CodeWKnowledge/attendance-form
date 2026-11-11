/*
# Restrict table privileges to what the app needs

1. Modified Tables
- `attendance`: visitors (anon) may only insert records. Signed-in admins may read and delete records. Nobody may edit records.
- `admins`: no role can reach this table through the Data API.

2. Security
- Removes the broad default privileges that Supabase grants to the public and signed-in roles on new tables.
- Row level security policies on `attendance` remain unchanged and still control which rows are visible.

3. Important Notes
- Re-running this migration is safe: revoking a privilege that is already absent has no effect.
*/

REVOKE ALL ON attendance FROM anon, authenticated;
GRANT INSERT ON attendance TO anon, authenticated;
GRANT SELECT, DELETE ON attendance TO authenticated;

REVOKE ALL ON admins FROM anon, authenticated;
