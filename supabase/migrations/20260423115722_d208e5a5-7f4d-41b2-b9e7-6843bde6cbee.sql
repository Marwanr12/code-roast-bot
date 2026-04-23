-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can view roasts" ON public.roasts;
DROP POLICY IF EXISTS "Anyone can create roasts" ON public.roasts;

-- Remove orphan rows (no owner) before enforcing NOT NULL
DELETE FROM public.roasts;

-- Add user_id linking each roast to an authenticated user
ALTER TABLE public.roasts
  ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_roasts_user_id ON public.roasts (user_id);

-- New strict RLS policies
CREATE POLICY "Users can view their own roasts"
ON public.roasts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roasts"
ON public.roasts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roasts"
ON public.roasts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);