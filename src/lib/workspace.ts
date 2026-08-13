import { supabase } from "@/integrations/supabase/client";

export type Organization = { id: string; name: string; slug: string; owner_id: string };
export type Department = { id: string; organization_id: string; name: string; description: string | null };
export type Employee = {
  id: string; organization_id: string; department_id: string | null; email: string;
  first_name: string | null; last_name: string | null; job_title: string | null;
  phone: string | null; mobile: string | null; company: string | null; location: string | null;
  status: "active" | "inactive"; source: "manual" | "csv" | "google" | "microsoft";
};

export async function getCurrentOrganization(): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id,name,slug,owner_id)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const org = membership?.organizations as unknown as Organization | null;
  return org ?? null;
}

export async function createWorkspace(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  const { data: org, error } = await supabase.from("organizations").insert({ name, slug, owner_id: user.id }).select().single();
  if (error) throw error;
  const { error: memberError } = await supabase.from("organization_members").insert({ organization_id: org.id, user_id: user.id, role: "admin" });
  if (memberError) throw memberError;
  return org as Organization;
}

export async function listDepartments(organizationId: string) {
  const { data, error } = await supabase.from("departments").select("*").eq("organization_id", organizationId).order("name");
  if (error) throw error;
  return (data ?? []) as Department[];
}

export async function listEmployees(organizationId: string) {
  const { data, error } = await supabase.from("employees").select("*").eq("organization_id", organizationId).order("first_name");
  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function upsertEmployee(employee: Partial<Employee> & { organization_id: string; email: string }) {
  const { data, error } = await supabase.from("employees").upsert(employee, { onConflict: "organization_id,email" }).select().single();
  if (error) throw error;
  return data as Employee;
}

export async function assignSignature(organizationId: string, employeeId: string, signatureId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("employee_signature_assignments").upsert({
    organization_id: organizationId, employee_id: employeeId, signature_id: signatureId, assigned_by: user?.id ?? null,
  }, { onConflict: "employee_id" });
  if (error) throw error;
}

export function parseEmployeeCsv(text: string) {
  const rows = text.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length < 2) return [];
  const split = (line: string) => line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(v => v.trim().replace(/^\"|\"$/g, ""));
  const headers = split(rows[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  return rows.slice(1).map(line => {
    const values = split(line); const item: Record<string, string> = {};
    headers.forEach((h, i) => { item[h] = values[i] ?? ""; });
    const fullName = item.name || item.full_name || "";
    const parts = fullName.trim().split(/\s+/);
    return {
      email: item.email,
      first_name: item.first_name || parts[0] || "",
      last_name: item.last_name || parts.slice(1).join(" ") || "",
      job_title: item.job_title || item.title || "",
      phone: item.phone || "", mobile: item.mobile || "",
      company: item.company || "", location: item.location || "",
      department: item.department || "",
    };
  }).filter(r => r.email);
}
