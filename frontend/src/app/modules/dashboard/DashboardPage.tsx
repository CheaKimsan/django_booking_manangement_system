import { useAuth } from "../auth/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();

  console.log(user)

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;