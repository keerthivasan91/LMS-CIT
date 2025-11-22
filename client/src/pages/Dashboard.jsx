import React, { useContext, useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import "../App.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    role: user?.role || "",
  });

  // Load profile only if user is not already available from AuthContext
  useEffect(() => {
    if (user?.name && user?.role) {
      setProfile({ name: user.name, role: user.role });
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axios.get("/profile");
        setProfile({
          name: res.data?.name || "User",
          role: res.data?.role || "member",
        });
      } catch {
        setProfile({
          name: "User",
          role: "member",
        });
      }
    };

    loadProfile();
  }, [user]);

  const capitalizedRole = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "";

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Welcome, {profile.name} ({capitalizedRole})
      </h1>

      <div className="dashboard-card">
        <h3 className="card-heading">Important Information</h3>
        <ul className="info-list">
          <li>You will receive one email each when the HOD and the Principal approves/rejects your application.</li>
          <li>You cannot club CL and EL.</li>
          <li>Apply for OOD while going out on College Work.</li>
          <li>Apply for SCL while going out on VTU work like Examination duty, VTU Meetings, etc.</li>
          <li>To Apply for PL, prior permission from the Principal is necessary and mention the reason clearly in the leave application.</li>
          <li>To Apply for Compensatory Off, mention the date for which Comp Off is being claimed.</li>
          <li>Apply for LOP when CL and EL are exhausted.</li>
          <li>Leave applications without valid reason may be rejected.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
