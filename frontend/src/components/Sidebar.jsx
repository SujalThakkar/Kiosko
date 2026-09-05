import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  History,
  PackageSearch,
  ClipboardCheck,
  Users,
  BarChart3,
  Boxes,
  ScanLine,
  LogOut,
} from "lucide-react";
import SomaiyaMark from "./SomaiyaMark";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  student: [
    { to: "/student", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/student/request", label: "Request Component", icon: PackageSearch },
    { to: "/student/history", label: "Issue History", icon: History },
  ],
  professor: [
    { to: "/professor", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/professor/requests", label: "All Requests (read-only)", icon: ClipboardCheck },
    { to: "/professor/usage", label: "Lab Usage Reports", icon: BarChart3 },
  ],
  lab_assistant: [
    { to: "/lab-assistant", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/lab-assistant/approvals", label: "Pending Approvals", icon: ClipboardCheck },
    { to: "/lab-assistant/kiosk", label: "Live Kiosk Feed", icon: ScanLine },
    { to: "/lab-assistant/inventory", label: "Inventory", icon: Boxes },
    { to: "/lab-assistant/students", label: "Student Records", icon: Users },
  ],
};

export default function Sidebar({ role }) {
  const items = NAV_BY_ROLE[role] || [];
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-paper border-r border-ink/5 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-ink/5">
        <SomaiyaMark size="md" />
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-thin">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body font-medium transition-colors ${
                isActive
                  ? "bg-power-red/[0.08] text-power-red"
                  : "text-slate hover:bg-mist hover:text-ink"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-ink/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-body font-medium text-slate hover:bg-mist hover:text-power-red transition-colors"
        >
          <LogOut size={17} strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
