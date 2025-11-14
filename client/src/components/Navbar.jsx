import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-content">

        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          Faculty Leave Management
        </NavLink>

        {/* RIGHT SIDE: Notification + User Info + Logout */}
        <div className="navbar-user">

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Info */}
          <div className="user-info">
            <strong>{user?.name || "Guest"}</strong>
            <br />
            {(user?.role || "Not logged in").toUpperCase()} - {user?.department || "N/A"}
          </div>

          {/* Logout */}
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
