import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { Role } from "../modules/auth/core/types";

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;