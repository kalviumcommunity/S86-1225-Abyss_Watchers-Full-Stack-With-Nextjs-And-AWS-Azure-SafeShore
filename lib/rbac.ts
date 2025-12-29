export type Role = "ADMIN" | "STAFF" | "PATIENT" | string;

import { logger } from "./logger";

export const roles: Record<Role, string[]> = {
  ADMIN: ["create", "read", "update", "delete"],
  STAFF: ["read", "update"],
  PATIENT: ["read"],
};

export function hasPermission(role: Role | undefined | null, action: string) {
  if (!role) return false;
  const perms = roles[role] || [];
  return perms.includes(action);
}

export function logDecision(role: Role | undefined | null, resource: string, action: string, allowed: boolean) {
  try {
    logger.info(`[RBAC] ${role ?? "anonymous"} attempted to ${action} ${resource}: ${allowed ? "ALLOWED" : "DENIED"}`,
      { role, resource, action, allowed, timestamp: new Date().toISOString() }
    );
  } catch (e) {
    // ignore logging failures
    console.log(`[RBAC] ${role ?? "anonymous"} ${allowed ? "ALLOWED" : "DENIED"} ${action} ${resource}`);
  }
}

export default {
  roles,
  hasPermission,
  logDecision,
};
