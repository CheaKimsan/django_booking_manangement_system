import type { UserRole } from "../_movie/constants/nav";

/**
 * Derive the current user's role from whatever shape your User object has.
 * Adjust the checks to match your actual User model.
 *
 * Priority: ADMIN > THEATER_MANAGER > STAFF > CUSTOMER
 */
export function deriveRole(user: any): UserRole {
    if (!user) return "CUSTOMER";

    // System-level admin
    if (user.is_superuser || user.is_admin) return "ADMIN";

    // Explicit role field (best case — trust it)
    const r = String(user.role ?? "").toUpperCase();
    if (r === "ADMIN") return "ADMIN";
    if (r === "THEATER_MANAGER" || r === "MANAGER") return "THEATER_MANAGER";
    if (r === "STAFF") return "STAFF";

    // Fallback flags
    if (user.is_theater_manager || user.is_manager) return "THEATER_MANAGER";
    if (user.is_staff) return "STAFF";

    return "CUSTOMER";
}

/** Check if a role can access an item with the given allowed roles */
export function canAccess(
    role: UserRole,
    allowed: UserRole[] | undefined
): boolean {
    if (!allowed) return true;
    return allowed.includes(role);
}

/** Convenience helpers */
export const isAdmin = (role: UserRole) => role === "ADMIN";
export const isManager = (role: UserRole) => role === "THEATER_MANAGER";
export const isStaff = (role: UserRole) => role === "STAFF";
export const isCustomer = (role: UserRole) => role === "CUSTOMER";

export const isInternal = (role: UserRole) =>
    role === "ADMIN" || role === "THEATER_MANAGER" || role === "STAFF";

export const canEdit = (role: UserRole) =>
    role === "ADMIN" || role === "THEATER_MANAGER";