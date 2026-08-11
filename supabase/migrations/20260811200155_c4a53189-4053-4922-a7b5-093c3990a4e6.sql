CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','manager'))
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

DROP POLICY "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

DROP POLICY "Staff can view all roles" ON public.user_roles;
CREATE POLICY "Staff can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

DROP POLICY "Admins can grant roles" ON public.user_roles;
CREATE POLICY "Admins can grant roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Admins can revoke roles" ON public.user_roles;
CREATE POLICY "Admins can revoke roles" ON public.user_roles FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Staff can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Staff can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

DROP POLICY "Admins can update any subscription" ON public.subscriptions;
CREATE POLICY "Admins can update any subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY "Staff can view all purchases" ON public.purchases;
CREATE POLICY "Staff can view all purchases" ON public.purchases FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);