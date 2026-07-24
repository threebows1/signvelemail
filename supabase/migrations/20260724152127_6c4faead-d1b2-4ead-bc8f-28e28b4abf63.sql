CREATE TABLE public.signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Untitled Signature',
    template_id text NOT NULL DEFAULT 'left-line',
    status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active')),
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.signatures TO authenticated;
GRANT ALL ON public.signatures TO service_role;

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signatures"
ON public.signatures
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own signatures"
ON public.signatures
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own signatures"
ON public.signatures
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own signatures"
ON public.signatures
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE INDEX idx_signatures_user_id ON public.signatures(user_id);

CREATE OR REPLACE FUNCTION public.update_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_signatures_updated_at
BEFORE UPDATE ON public.signatures
FOR EACH ROW EXECUTE FUNCTION public.update_signatures_updated_at();
