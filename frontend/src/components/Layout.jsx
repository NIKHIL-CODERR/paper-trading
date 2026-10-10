import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Desk", icon: "◆" },
  { to: "/history", label: "History", icon: "≡" },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-line md:bg-panel">
        <div className="px-6 py-6">
          <p className="font-display text-lg font-700 tracking-tight">Paper Desk</p>
          <p className="text-xs text-slate-500 mt-1">practice markets</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-line text-white" : "text-slate-400 hover:text-white hover:bg-line/60"
                }`
              }
            >
              <span className="text-mint">{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-line">
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="tabular text-sm text-mint mt-1">
            ${user?.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <button onClick={logout} className="mt-3 text-xs text-slate-500 hover:text-rose">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-line bg-panel">
        <p className="font-display font-700">Paper Desk</p>
        <p className="tabular text-sm text-mint">
          ${user?.balance?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </header>

      <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-20 md:pb-8 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-line bg-panel flex">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? "text-mint" : "text-slate-500"
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
        <button onClick={logout} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs text-slate-500">
          <span>×</span>
          Sign out
        </button>
      </nav>
    </div>
  );
}
