import React, { useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { NavLink } from "react-router-dom";

const Navbar = ({ onCounters, sidebarOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <button 
          className={`hamburger ${sidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

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
