import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOrganization, listDepartments, listEmployees, parseEmployeeCsv, upsertEmployee, assignSignature, type Department, type Employee, type Organization } from "@/lib/workspace";

export const Route = createFileRoute("/app/employees")({ component: EmployeesPage });

type Signature = { id: string; name: string };

function EmployeesPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    const current = await getCurrentOrganization(); setOrg(current);
    if (!current) return;
    const [people, deps, sigs] = await Promise.all([
      listEmployees(current.id), listDepartments(current.id),
      supabase.from("signatures").select("id,name").eq("organization_id", current.id).order("name"),
    ]);
    setEmployees(people); setDepartments(deps); setSignatures((sigs.data ?? []) as Signature[]);
  }
  useEffect(() => { refresh().catch(e => setMessage(e.message)); }, []);

  const filtered = useMemo(() => employees.filter(e => `${e.first_name ?? ""} ${e.last_name ?? ""} ${e.email} ${e.job_title ?? ""}`.toLowerCase().includes(search.toLowerCase())), [employees, search]);

  async function importCsv(file: File) {
    if (!org) return;
    setMessage("Importing employees…");
    const rows = parseEmployeeCsv(await file.text());
    for (const row of rows) {
      let departmentId: string | null = null;
      if (row.department) {
        let dep = departments.find(d => d.name.toLowerCase() === row.department.toLowerCase());
        if (!dep) {
          const created = await supabase.from("departments").insert({ organization_id: org.id, name: row.department }).select().single();
          if (created.error) throw created.error;
          dep = created.data as Department;
        }
        departmentId = dep.id;
      }
      await upsertEmployee({ organization_id: org.id, email: row.email, first_name: row.first_name, last_name: row.last_name, job_title: row.job_title, phone: row.phone, mobile: row.mobile, company: row.company, location: row.location, department_id: departmentId, source: "csv", status: "active" });
    }
    setMessage(`${rows.length} employee${rows.length === 1 ? "" : "s"} imported.`); await refresh();
  }

  return <div className="p-8 max-w-7xl mx-auto">
    <div className="flex items-start justify-between gap-4 mb-8">
      <div><p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">People</p><h1 className="text-3xl font-semibold">Employees</h1><p className="text-muted-foreground mt-2">Manage people, departments, and their assigned email signatures.</p></div>
      <div className="flex gap-2"><Link to="/app/departments" className="px-4 py-2 border rounded-lg text-sm">Departments</Link><label className="px-4 py-2 bg-foreground text-background rounded-lg text-sm cursor-pointer">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => e.target.files?.[0] && importCsv(e.target.files[0]).catch(err => setMessage(err.message))}/></label></div>
    </div>
    {message && <div className="mb-4 p-3 rounded-lg bg-secondary text-sm">{message}</div>}
    {!org ? <div className="border rounded-xl p-8">No workspace found. Apply the Phase 1 database migration first.</div> : <>
      <div className="grid grid-cols-3 gap-4 mb-6"><Stat label="Employees" value={employees.length}/><Stat label="Departments" value={departments.length}/><Stat label="Signatures" value={signatures.length}/></div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" className="w-full border rounded-lg px-4 py-3 mb-4 bg-background" />
      <div className="border rounded-xl overflow-hidden bg-white"><table className="w-full text-sm"><thead className="bg-secondary"><tr><Th>Employee</Th><Th>Job title</Th><Th>Department</Th><Th>Status</Th><Th>Signature</Th></tr></thead><tbody>{filtered.map(e => <tr key={e.id} className="border-t"><Td><div className="font-medium">{[e.first_name,e.last_name].filter(Boolean).join(" ") || "Unnamed"}</div><div className="text-muted-foreground">{e.email}</div></Td><Td>{e.job_title || "—"}</Td><Td>{departments.find(d => d.id === e.department_id)?.name || "—"}</Td><Td><span className="capitalize">{e.status}</span></Td><Td><select defaultValue="" className="border rounded-md px-2 py-2 bg-background" onChange={ev => ev.target.value && org && assignSignature(org.id,e.id,ev.target.value).then(()=>setMessage("Signature assigned.")).catch(err=>setMessage(err.message))}><option value="">Assign signature…</option>{signatures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Td></tr>)}{filtered.length===0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No employees yet. Import a CSV to get started.</td></tr>}</tbody></table></div>
    </>}
  </div>;
}
function Stat({label,value}:{label:string;value:number}) { return <div className="border rounded-xl p-5 bg-white"><div className="text-2xl font-semibold">{value}</div><div className="text-sm text-muted-foreground">{label}</div></div> }
function Th({children}:{children:React.ReactNode}) { return <th className="text-left font-medium p-4">{children}</th> }
function Td({children}:{children:React.ReactNode}) { return <td className="p-4 align-middle">{children}</td> }
