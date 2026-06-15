import { usePage } from '@inertiajs/react';
import type { SharedProps, UserRole } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedProps>().props;

    return {
        user:        auth.user,
        permissions: auth.permissions,
        isLoggedIn:  auth.user !== null,

        hasRole:     (role: UserRole) => auth.user?.role === role,
        hasAnyRole:  (roles: UserRole[]) => roles.includes(auth.user?.role as UserRole),
        can:         (permission: string) => auth.permissions.includes(permission),
        canAny:      (perms: string[]) => perms.some((p) => auth.permissions.includes(p)),

        isSuperAdmin: () => auth.user?.role === 'super_admin',
        isAdmin:      () => auth.user?.role === 'admin',
        isStudent:    () => auth.user?.role === 'student',
    };
}
