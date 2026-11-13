import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { deriveRole } from "../../helpers/Role";
import type { UserRole } from "../../_movie/constants/nav";

interface Props {
    children: React.ReactNode;
    roles?: UserRole[];
}

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    }

    if (!user) {
        return null;
    }

    const role = deriveRole(user);

    if (roles && !roles.includes(role)) {
        const fallback =
            role === "CUSTOMER" ? "/" : "/management/dashboard";
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;