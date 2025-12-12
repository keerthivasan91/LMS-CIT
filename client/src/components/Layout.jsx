import React, { useState, useCallback } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [counters, setCounters] = useState({
    pendingSubs: 0,
    pendingHod: 0,
    pendingPrincipal: 0,
  });
  
  // 🔥 CRITICAL: Add sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
    document.body.classList.toggle('sidebar-open', !sidebarOpen);
  }, [sidebarOpen]);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  }, []);

  const handleCounters = useCallback((data) => {
    setCounters(data);
  }, []);

  return (
    <>
      {/* Pass sidebar controls to Navbar */}
      <Navbar 
        onCounters={handleCounters}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="page-container">
        {/* Sidebar Overlay - Add this! */}
        <div 
          className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={closeSidebar}
        />

        {/* Pass state to Sidebar */}
        <Sidebar
          pendingSubs={counters.pendingSubs}
          pendingHod={counters.pendingHod}
          pendingPrincipal={counters.pendingPrincipal}
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default React.memo(Layout);