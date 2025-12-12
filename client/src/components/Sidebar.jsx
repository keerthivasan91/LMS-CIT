import React, { useContext, useMemo, useEffect } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { isHOD, isAdmin, isFaculty } from "../utils/roles";

const Sidebar = ({
  pendingSubs = 0,
  pendingHod = 0,
  pendingPrincipal = 0,
  notifCount = 0,
  sidebarOpen,
  closeSidebar,
  isLoading = false
}) => {

  const { user } = useContext(AuthContext);

  const roleInfo = useMemo(() => ({
    isAdmin: isAdmin(user),
    isHod: isHOD(user),
    isFaculty: isFaculty(user)
  }), [user]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [sidebarOpen, closeSidebar]);

  if (isLoading) {
    return (
      <aside className="sidebar loading">
        <h3 style={{ textAlign: "center" }}>Menu</h3>
        <div className="sidebar-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-item" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside 
      className={`sidebar ${sidebarOpen ? "active" : ""}`}
      aria-label="Main navigation"
      aria-hidden={!sidebarOpen}
    >
      <h3 style={{ textAlign: "center" }} id="sidebar-menu-title">Menu</h3>

      <ul onClick={closeSidebar} aria-labelledby="sidebar-menu-title">

        <li>
          <NavLink to="/dashboard" end>
            Dashboard
            {notifCount > 0 && <span className="sidebar-badge">{notifCount}</span>}
          </NavLink>
        </li>

        {!roleInfo.isAdmin && (
          <li>
            <NavLink to="/apply">Apply For Leave</NavLink>
          </li>
        )}

        <li>
          <NavLink to="/leave-history">Leave History</NavLink>
        </li>

        {roleInfo.isFaculty && !roleInfo.isAdmin && (
          <li>
            <NavLink to="/substitute-requests">
              Substitute Requests
              {pendingSubs > 0 && (
                <span className="sidebar-badge">{pendingSubs}</span>
              )}
            </NavLink>
          </li>
        )}

        <li><NavLink to="/holidays">Holiday Calendar</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>

        {roleInfo.isHod && (
          <>
            <li>
              <NavLink to="/hod">
                HOD Approvals
                {pendingHod > 0 && (
                  <span className="sidebar-badge">{pendingHod}</span>
                )}
              </NavLink>
            </li>

            <li><NavLink to="/hod/leave-balance">Leave Balance</NavLink></li>
          </>
        )}

        {roleInfo.isAdmin && (
          <>
            <li>
              <NavLink to="/principal-approvals">
                Principal Approvals
                {pendingPrincipal > 0 && (
                  <span className="sidebar-badge">{pendingPrincipal}</span>
                )}
              </NavLink>
            </li>

            <li><NavLink to="/admin/add-user">Add User</NavLink></li>
            <li><NavLink to="/admin/delete-user">Delete User</NavLink></li>
            <li><NavLink to="/admin/reset-requests">Password Reset Requests</NavLink></li>
          </>
        )}

      </ul>
    </aside>
  );
};

export default React.memo(Sidebar);