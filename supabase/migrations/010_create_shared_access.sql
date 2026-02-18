CREATE TABLE public.shared_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  permission TEXT NOT NULL DEFAULT 'viewer' CHECK (permission IN ('viewer', 'editor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(owner_id, shared_with_email)
);

CREATE INDEX idx_shared_access_owner ON public.shared_access(owner_id);
CREATE INDEX idx_shared_access_shared_with ON public.shared_access(shared_with_id);
CREATE INDEX idx_shared_access_email ON public.shared_access(shared_with_email);

ALTER TABLE public.shared_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their shares"
  ON public.shared_access FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view shares directed at them"
  ON public.shared_access FOR SELECT
  USING (auth.uid() = shared_with_id);

CREATE POLICY "Users can respond to shares"
  ON public.shared_access FOR UPDATE
  USING (auth.uid() = shared_with_id)
  WITH CHECK (auth.uid() = shared_with_id);

-- Resolve pending shares by matching the logged-in user's email
CREATE OR REPLACE FUNCTION resolve_pending_shares()
RETURNS void AS $$
BEGIN
  UPDATE public.shared_access
  SET shared_with_id = auth.uid()
  WHERE shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND shared_with_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a user exists by email (returns name only, never exposes email)
CREATE OR REPLACE FUNCTION check_user_exists(p_email TEXT)
RETURNS TABLE(user_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.full_name
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
