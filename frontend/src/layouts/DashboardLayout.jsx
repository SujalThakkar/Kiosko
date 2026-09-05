import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ role }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-mist">
      <Sidebar role={role} />
      <main className="flex-1 min-w-0">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
