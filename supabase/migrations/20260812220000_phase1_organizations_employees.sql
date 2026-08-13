-- Phase 1: organization, departments, employees, and signature assignments

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  job_title text,
  phone text,
  mobile text,
  company text,
  location text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'google', 'microsoft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE TABLE public.employee_signature_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  signature_id uuid NOT NULL REFERENCES public.signatures(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id)
);

ALTER TABLE public.signatures ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_departments_org ON public.departments(organization_id);
CREATE INDEX idx_employees_org ON public.employees(organization_id);
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_employee_assignments_org ON public.employee_signature_assignments(organization_id);
CREATE INDEX idx_signatures_org ON public.signatures(organization_id);

CREATE OR REPLACE FUNCTION public.is_org_member(_organization_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _organization_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_org(_organization_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _organization_id
      AND user_id = _user_id
      AND role IN ('admin', 'manager')
  );
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.organization_members, public.departments, public.employees, public.employee_signature_assignments TO authenticated;
GRANT ALL ON public.organizations, public.organization_members, public.departments, public.employees, public.employee_signature_assignments TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_signature_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view organizations" ON public.organizations FOR SELECT TO authenticated
USING (public.is_org_member(id));
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Managers can update organizations" ON public.organizations FOR UPDATE TO authenticated
USING (public.can_manage_org(id)) WITH CHECK (public.can_manage_org(id));
CREATE POLICY "Owners can delete organizations" ON public.organizations FOR DELETE TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Members can view organization membership" ON public.organization_members FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can add organization members" ON public.organization_members FOR INSERT TO authenticated
WITH CHECK (public.can_manage_org(organization_id) OR user_id = auth.uid());
CREATE POLICY "Managers can update organization members" ON public.organization_members FOR UPDATE TO authenticated
USING (public.can_manage_org(organization_id)) WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can remove organization members" ON public.organization_members FOR DELETE TO authenticated
USING (public.can_manage_org(organization_id));

CREATE POLICY "Members can view departments" ON public.departments FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can create departments" ON public.departments FOR INSERT TO authenticated
WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can update departments" ON public.departments FOR UPDATE TO authenticated
USING (public.can_manage_org(organization_id)) WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can delete departments" ON public.departments FOR DELETE TO authenticated
USING (public.can_manage_org(organization_id));

CREATE POLICY "Members can view employees" ON public.employees FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can create employees" ON public.employees FOR INSERT TO authenticated
WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can update employees" ON public.employees FOR UPDATE TO authenticated
USING (public.can_manage_org(organization_id)) WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can delete employees" ON public.employees FOR DELETE TO authenticated
USING (public.can_manage_org(organization_id));

CREATE POLICY "Members can view assignments" ON public.employee_signature_assignments FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can create assignments" ON public.employee_signature_assignments FOR INSERT TO authenticated
WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can update assignments" ON public.employee_signature_assignments FOR UPDATE TO authenticated
USING (public.can_manage_org(organization_id)) WITH CHECK (public.can_manage_org(organization_id));
CREATE POLICY "Managers can delete assignments" ON public.employee_signature_assignments FOR DELETE TO authenticated
USING (public.can_manage_org(organization_id));

CREATE POLICY "Members can view organization signatures" ON public.signatures FOR SELECT TO authenticated
USING (organization_id IS NOT NULL AND public.is_org_member(organization_id));
CREATE POLICY "Managers can create organization signatures" ON public.signatures FOR INSERT TO authenticated
WITH CHECK (organization_id IS NOT NULL AND public.can_manage_org(organization_id));
CREATE POLICY "Managers can update organization signatures" ON public.signatures FOR UPDATE TO authenticated
USING (organization_id IS NOT NULL AND public.can_manage_org(organization_id))
WITH CHECK (organization_id IS NOT NULL AND public.can_manage_org(organization_id));
CREATE POLICY "Managers can delete organization signatures" ON public.signatures FOR DELETE TO authenticated
USING (organization_id IS NOT NULL AND public.can_manage_org(organization_id));

CREATE TRIGGER organizations_touch BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER departments_touch BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER employees_touch BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Bootstrap one workspace for each existing user. Existing personal signatures remain valid
-- and are attached to the workspace where possible.
INSERT INTO public.organizations (name, slug, owner_id)
SELECT COALESCE(NULLIF(p.full_name, ''), split_part(COALESCE(p.email, u.email), '@', 1), 'My') || '''s Workspace',
       'workspace-' || replace(u.id::text, '-', ''), u.id
FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT o.id, o.owner_id, 'admin'::public.app_role FROM public.organizations o
ON CONFLICT (organization_id, user_id) DO NOTHING;

UPDATE public.signatures s SET organization_id = o.id
FROM public.organizations o WHERE o.owner_id = s.user_id AND s.organization_id IS NULL;
