-- 1. PLANS ---------------------------------------------------------------
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  monthly_cents integer NOT NULL DEFAULT 0,
  yearly_cents integer NOT NULL DEFAULT 0,
  signature_limit integer NOT NULL DEFAULT 1,
  employee_limit integer NOT NULL DEFAULT 1,
  trial_days integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.plans TO anon;
GRANT SELECT ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT TO anon, authenticated USING (is_active);

CREATE POLICY "Staff can view all plans" ON public.plans
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE POLICY "Admins can create plans" ON public.plans
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update plans" ON public.plans
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plans" ON public.plans
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER plans_touch BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.plans (id, name, tagline, monthly_cents, yearly_cents, signature_limit, employee_limit, trial_days, sort_order, features) VALUES
  ('free',    'Free',    '1 signature',           0,    0,     1,   1, 7, 1, '{"export_html":true,"export_outlook":false,"custom_branding":false,"team_rollout":false,"priority_support":false}'::jsonb),
  ('starter', 'Starter', '10 signatures',       499, 4790,    10,  10, 0, 2, '{"export_html":true,"export_outlook":true,"custom_branding":true,"team_rollout":false,"priority_support":false}'::jsonb),
  ('growth',  'Growth',  '30 signatures',      2000, 19200,   30,  50, 0, 3, '{"export_html":true,"export_outlook":true,"custom_branding":true,"team_rollout":true,"priority_support":false}'::jsonb),
  ('custom',  'Custom',  'Unlimited signatures',  0,    0, 100000, 100000, 0, 4, '{"export_html":true,"export_outlook":true,"custom_branding":true,"team_rollout":true,"priority_support":true}'::jsonb);

-- 2. COMPLIMENTARY ACCESS ------------------------------------------------
CREATE TABLE public.complimentary_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  plan_id text NOT NULL DEFAULT 'starter',
  plan_name text NOT NULL DEFAULT 'Starter',
  duration text NOT NULL DEFAULT 'lifetime',
  expires_at timestamptz,
  note text,
  granted_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX complimentary_access_user_idx ON public.complimentary_access (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.complimentary_access TO authenticated;
GRANT ALL ON public.complimentary_access TO service_role;

ALTER TABLE public.complimentary_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own complimentary access" ON public.complimentary_access
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Staff can view all complimentary access" ON public.complimentary_access
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE POLICY "Admins can grant complimentary access" ON public.complimentary_access
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can change complimentary access" ON public.complimentary_access
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can remove complimentary access" ON public.complimentary_access
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER complimentary_access_touch BEFORE UPDATE ON public.complimentary_access
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. PROFILES: org + account status -------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN organization_name text,
  ADD COLUMN account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN suspended_at timestamptz,
  ADD COLUMN last_active_at timestamptz;

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- 4. SUBSCRIPTIONS: admin insert on behalf of a customer ----------------
CREATE POLICY "Admins can create subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- 5. SIGNATURES: staff oversight + suspension enforcement ---------------
CREATE OR REPLACE FUNCTION private.is_suspended(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND account_status = 'suspended'
  )
$$;

REVOKE ALL ON FUNCTION private.is_suspended(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_suspended(uuid) TO authenticated, service_role;

CREATE POLICY "Staff can view all signatures" ON public.signatures
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE POLICY "Staff can reassign signatures" ON public.signatures
  FOR UPDATE TO authenticated
  USING (private.is_staff(auth.uid()))
  WITH CHECK (private.is_staff(auth.uid()));

CREATE POLICY "Admins can delete any signature" ON public.signatures
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Users can create their own signatures" ON public.signatures;
CREATE POLICY "Users can create their own signatures" ON public.signatures
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND NOT private.is_suspended(auth.uid()));

DROP POLICY "Users can update their own signatures" ON public.signatures;
CREATE POLICY "Users can update their own signatures" ON public.signatures
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND NOT private.is_suspended(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND NOT private.is_suspended(auth.uid()));

-- 6. APP SETTINGS -------------------------------------------------------
CREATE TABLE public.app_settings (
  id text PRIMARY KEY DEFAULT 'global',
  support_email text,
  product_name text NOT NULL DEFAULT 'Sign Vel',
  default_trial_days integer NOT NULL DEFAULT 7,
  signups_enabled boolean NOT NULL DEFAULT true,
  maintenance_mode boolean NOT NULL DEFAULT false,
  announcement text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view settings" ON public.app_settings
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

CREATE POLICY "Admins can create settings" ON public.app_settings
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER app_settings_touch BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.app_settings (id, support_email) VALUES ('global', 'support@signvel.com');
