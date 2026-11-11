import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <NavLink to="/notes" className="text-xl font-bold text-brand-600">
              NoteVault
            </NavLink>
            <nav className="flex items-center gap-1">
              <NavItem to="/notes">My Notes</NavItem>
              {user?.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
              <NavItem to="/insights">Insights</NavItem>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 hidden sm:block">
              <span className="font-medium text-gray-900">{user?.name}</span>
              {user?.role === "admin" && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-brand-50 text-brand-700 rounded">
                  admin
                </span>
              )}
            </div>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`
      }
    >
      {children}
    </NavLink>
  );
}