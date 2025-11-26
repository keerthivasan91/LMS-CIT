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

  // prevent Navbar from re-rendering unnecessarily
  const handleCounters = useCallback((data) => {
    setCounters(data);
  }, []);

  return (
    <>
      <Navbar onCounters={handleCounters} />

      <div className="page-container">

        <Sidebar
          pendingSubs={counters.pendingSubs}
          pendingHod={counters.pendingHod}
          pendingPrincipal={counters.pendingPrincipal}
        />

        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </>
  );
};

export default React.memo(Layout);
