import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;