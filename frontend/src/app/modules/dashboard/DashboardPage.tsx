import { useAuth } from "../auth/AuthContext";

const DashboardPage = () => {
  const { user, logout } = useAuth();

    console.log(user)

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;