import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [counters, setCounters] = useState({
    pendingSubs: 0,
    pendingHod: 0,
    pendingPrincipal: 0,
  });

  return (
    <>
      <Navbar onCounters={setCounters} />

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

export default Layout;
