import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { isHOD, isAdmin, isFaculty } from "../utils/roles";

const Sidebar = ({
  pendingSubs = 0,
  pendingHod = 0,
  pendingPrincipal = 0,
  notifCount = 0,
  sidebarOpen,
  closeSidebar
}) => {

  const { user } = useContext(AuthContext);

  return (
    <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
      <h3 style={{ textAlign: "center" }}>Menu</h3>

      <ul onClick={closeSidebar}>

        <li>
          <NavLink to="/dashboard">
            Dashboard
            {notifCount > 0 && (
              <span className="notification">{notifCount}</span>
            )}
          </NavLink>
        </li>

        {!isAdmin(user) && (
          <li>
            <NavLink to="/apply">Apply For Leave</NavLink>
          </li>
        )}

        <li>
          <NavLink to="/leave-history">Leave History</NavLink>
        </li>

        {isFaculty(user) && isAdmin(user) !== true && (
          <li>
            <NavLink to="/substitute-requests">
              Substitute Requests
              {pendingSubs > 0 && (
                <span className="notification">{pendingSubs}</span>
              )}
            </NavLink>
          </li>
        )}

        <li><NavLink to="/holidays">Holiday Calendar</NavLink></li>

        <li><NavLink to="/profile">Profile</NavLink></li>

        {isHOD(user) && (
          <>
            <li>
              <NavLink to="/hod">
                HOD Approvals
                {pendingHod > 0 && (
                  <span className="notification">{pendingHod}</span>
                )}
              </NavLink>
            </li>

            <li><NavLink to="/hod/leave-balance">Leave Balance</NavLink></li>
          </>
        )}

        {isAdmin(user) && (
          <>
            <li>
              <NavLink to="/principal-approvals">
                Principal Approvals
                {pendingPrincipal > 0 && (
                  <span className="notification">{pendingPrincipal}</span>
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

export default Sidebar;
