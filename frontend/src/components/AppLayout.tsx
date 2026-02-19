import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link active" : "nav-link";
}

export default function AppLayout() {
  const { role, username, logout } = useAuth();
  const showBatchMenu = role !== "TESTER";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="brand">Member Console</h1>
          <nav className="nav-links">
            <NavLink className={navClassName} to="/members">
              Members
            </NavLink>
            <NavLink className={navClassName} to="/apps">
              Apps
            </NavLink>
            {showBatchMenu && (
              <NavLink className={navClassName} to="/batch">
                Batch!!!
              </NavLink>
            )}
            <NavLink className={navClassName} to="/async-test">
              Async Test
            </NavLink>
          </nav>
        </div>
        <div className="topbar-right">
          <span className="identity">
            {username ?? "unknown"} ({role ?? "UNKNOWN"})
          </span>
          <button className="btn secondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
