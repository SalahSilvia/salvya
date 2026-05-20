-- Run AFTER 20250515180000_user_profiles_rbac.sql and 20250516260000_god_admin_role.sql
-- Replace the UUID with your auth.users.id (Supabase Dashboard → Authentication → Users)

-- God Admin (full access + role management):
-- update public.user_profiles set role = 'god_admin', updated_at = now() where user_id = '00000000-0000-0000-0000-000000000000';

-- Standard store admin:
-- update public.user_profiles set role = 'admin', updated_at = now() where user_id = '00000000-0000-0000-0000-000000000000';
