import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/smtp", label: "SMTP Servers" },
    { to: "/leads", label: "Leads" },
    { to: "/compose", label: "New Campaign" },
  ];
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="lock">🔒</span> Envelock
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          {user?.role === "admin" && <NavLink to="/users">Users &amp; Admin</NavLink>}
        </nav>
        <div className="spacer" />
        <div className="userbox">
          <div>{user?.email}</div>
          <div className="muted">{user?.role}</div>
          <button
            className="ghost sm"
            style={{ marginTop: 8 }}
            onClick={() => {
              logout();
              nav("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
