// routes/RequireRole.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/modules/auth/AuthContext";
import { deriveRole } from "./Role";
import type { UserRole } from "../_movie/constants/nav";

interface Props {
    roles: UserRole[];
    children: React.ReactNode;
    redirectTo?: string;
}

export default function RequireRole({
    roles,
    children,
    redirectTo = "/",
}: Props) {
    const { user } = useAuth();
    const role = deriveRole(user);

    if (!roles.includes(role)) {
        return <Navigate to={redirectTo} replace />;
    }
    return <>{children}</>;
}