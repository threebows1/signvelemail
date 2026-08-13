import type { AppRole } from "@/lib/auth";

/**
 * Workspace capabilities per role. These mirror the database policies —
 * the UI uses them to hide controls, the database enforces them for real.
 *
 *  admin   → full workspace control (employees, departments, signatures,
 *            integrations, billing, plans, settings, roles)
 *  manager → employees, departments, signature assignment, read-only billing
 *  user    → own signature/profile only
 */
export const CAPABILITIES = {
  admin: [
    "workspace.view",
    "employees.manage",
    "departments.manage",
    "signatures.viewAll",
    "signatures.assign",
    "signatures.deleteAny",
    "integrations.manage",
    "billing.view",
    "billing.manage",
    "customers.manage",
    "plans.manage",
    "complimentary.grant",
    "roles.manage",
    "settings.manage",
    "own.manage",
  ],
  manager: [
    "workspace.view",
    "employees.manage",
    "departments.manage",
    "signatures.viewAll",
    "signatures.assign",
    "billing.view",
    "own.manage",
  ],
  user: ["own.manage"],
} as const;

export type Capability = (typeof CAPABILITIES)["admin"][number];

export function can(roles: AppRole[], capability: Capability): boolean {
  return roles.some((role) => (CAPABILITIES[role] as readonly string[]).includes(capability));
}

export const ROLE_SUMMARY: Record<AppRole, { label: string; blurb: string }> = {
  admin: {
    label: "Admin",
    blurb: "Full workspace control — employees, departments, signatures, integrations, billing and settings.",
  },
  manager: {
    label: "Manager",
    blurb: "Employees, departments and signature assignment, plus read-only billing. Cannot change prices or roles.",
  },
  user: {
    label: "User",
    blurb: "Limited access — their own profile and signatures only.",
  },
};
