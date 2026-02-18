-- Fix profiles policy to allow users to see who invited them (pending shares)
-- Without this, the owner profile returns null for pending invitations

DROP POLICY IF EXISTS "Users can view own and shared profiles" ON public.profiles;

CREATE POLICY "Users can view own and shared profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR id IN (
      SELECT shared_with_id FROM public.shared_access
      WHERE owner_id = auth.uid() AND status = 'accepted'
    )
    OR id IN (
      SELECT owner_id FROM public.shared_access
      WHERE shared_with_id = auth.uid() AND status IN ('accepted', 'pending')
    )
  );
