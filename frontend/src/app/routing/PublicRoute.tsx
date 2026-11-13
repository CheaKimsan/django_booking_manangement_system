import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { deriveRole } from "../../helpers/Role";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        const role = deriveRole(user);

            if (role === "ADMIN" || role === "THEATER_MANAGER" || role === "STAFF") {
            return <Navigate to="/management/dashboard" replace />;
        }

        // Customers go to the customer homepage
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}