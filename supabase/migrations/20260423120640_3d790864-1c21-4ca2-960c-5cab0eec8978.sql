-- Drop user-scoped policies
DROP POLICY IF EXISTS "Users can view their own roasts" ON public.roasts;
DROP POLICY IF EXISTS "Users can create their own roasts" ON public.roasts;
DROP POLICY IF EXISTS "Users can delete their own roasts" ON public.roasts;

-- Drop user_id column and its index
DROP INDEX IF EXISTS idx_roasts_user_id;
ALTER TABLE public.roasts DROP COLUMN IF EXISTS user_id;

-- Keep RLS enabled but DENY all direct access from the public client.
-- Reads/writes will go exclusively through the backend (service role key bypasses RLS).
-- No policies = nothing is allowed for anon/authenticated roles.