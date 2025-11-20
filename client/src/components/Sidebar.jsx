import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../App.css";

import { isHOD, isAdmin, isFaculty } from "../utils/roles";

const Sidebar = ({ pendingSubs = 0, pendingHod = 0, pendingPrincipal = 0 }) => {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      <h3 style={{ textAlign: "center" }}>Menu</h3>

      <ul>
        {/* Dashboard */}
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>

        {/* Apply Leave – hide for admin */}
        {!isAdmin(user) && (
          <li>
            <NavLink to="/apply">Apply For Leave</NavLink>
          </li>
        )}

        {/* Leave History */}
        <li>
          <NavLink to="/leave-history">Leave History</NavLink>
        </li>

        {/* Substitute Requests – faculty only */}
        {isFaculty(user) && (
          <li>
            <NavLink to="/substitute-requests">
              Substitute Requests
              {pendingSubs > 0 && (
                <span className="notification">{pendingSubs}</span>
              )}
            </NavLink>
          </li>
        )}

        {/* Holiday Calendar */}
        <li>
          <NavLink to="/holidays">Holiday Calendar</NavLink>
        </li>

        {/* Profile */}
        <li>
          <NavLink to="/profile">Profile</NavLink>
        </li>

        {/* HOD Features */}
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

            <li>
              <NavLink to="/hod/leave-balance">Leave Balance</NavLink>
            </li>
          </>
        )}

        {/* Admin Features */}
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

            <li>
              <NavLink to="/admin/add-user">Add User</NavLink>
            </li>

            <li>
              <NavLink to="/admin/reset-requests">Password Reset Requests</NavLink>
            </li>
          </>
        )}
      </ul>

      {/*<div className="stats">
        <p><strong>{user?.name || "Guest"}</strong></p>
        <p>{user?.role?.toUpperCase() || "Not logged in"}</p>
        <p>{user?.department_code || "N/A"}</p>
      </div>*/}
    </aside>
  );
};

export default Sidebar;
