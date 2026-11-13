import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { deriveRole } from "../../helpers/Role";

export default function AdminHomeRedirect() {
    const { user } = useAuth();
    const role = deriveRole(user);

    if (role === "CUSTOMER") {
        return <Navigate to="/" replace />;
    }

    return <Navigate to="/management/dashboard" replace />;
}