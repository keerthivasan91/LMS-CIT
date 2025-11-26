import React, { useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { NavLink } from "react-router-dom";

const Navbar = ({ onCounters }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <nav className="navbar">
      <div className="navbar-content">

        <NavLink to="/dashboard" className="navbar-brand">
          Faculty Leave Management
        </NavLink>

        <NotificationBell onCounters={onCounters} />

        <div className="navbar-user">
          <div className="user-info">
            <strong>{user?.name}</strong><br />
            {user?.role?.toUpperCase()} - {user?.department_code}
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
