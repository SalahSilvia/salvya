-- Promote a user to admin (run in Supabase SQL Editor AFTER 20250515180000_user_profiles_rbac.sql)
-- Replace the email below if needed.

UPDATE public.user_profiles
SET role = 'admin', updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('salahaddinefarhi@gmail.com')
);

-- Verify:
-- SELECT u.email, p.role FROM auth.users u JOIN public.user_profiles p ON p.user_id = u.id WHERE p.role = 'admin';
