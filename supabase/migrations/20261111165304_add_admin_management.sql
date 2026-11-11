/*
# Add admin management for signed-in admins

1. New Functions
- `list_admins()`: returns the email addresses on the admin list, sorted alphabetically. Only callable by signed-in admins.
- `add_admin(new_email)`: adds an email address to the admin list. The address is trimmed and stored in lowercase, checked for a valid email format, and adding an address that is already an admin does nothing. Only callable by signed-in admins.

2. Data Seeded
- `udohknowledge5@gmail.com` is added to the admin list so this account can manage admins and attendance.

3. Security
- Both functions run with owner rights so the admin list stays hidden from the Data API, but each one first checks that the caller is an admin and raises an error otherwise.
- Only signed-in users can execute them; anonymous visitors cannot.

4. Important Notes
- An admin added before they have an account gains access as soon as they sign up with that email.
- Re-running this migration is safe: the seed row uses ON CONFLICT DO NOTHING and the functions are replaced.
*/

INSERT INTO public.admins (email)
VALUES ('udohknowledge5@gmail.com')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS SETOF text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view the admin list' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT a.email FROM public.admins a ORDER BY a.email;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_admin(new_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text := lower(btrim(new_email));
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can add admins' USING ERRCODE = '42501';
  END IF;
  IF char_length(normalized) > 254 OR normalized !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Please enter a valid email address' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.admins (email) VALUES (normalized)
  ON CONFLICT (email) DO NOTHING;
  RETURN normalized;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_admins() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.add_admin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_admin(text) TO authenticated;
