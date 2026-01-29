import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "../api/axiosConfig";
import "../App.css";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    name: "",
    user_id: "",
    department: "",
    email: "",
    phone: "",
    role: "",
  });

  const [leaveBalance, setLeaveBalance] = useState({
    casual_total: 0,
    earned_total: 0,
    rh_total: 0
  });

  // Load profile from context
  const loadProfile = () => {
    setProfile({
      name: user?.name || "",
      user_id: user?.user_id || "",
      department: user?.department_code || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "",
    });
  };

  // Fetch leave balance from backend
  const loadLeaveBalance = async () => {
    try {
      const res = await axios.get("/leave-balance"); 
      setLeaveBalance(res.data.balance);
      console.log("Rendering leave balance:", leaveBalance);
    } catch (err) {
      console.error("Error fetching leave balance", err);
    }
  };

  useEffect(() => {
    loadProfile();
    loadLeaveBalance();
  }, []);

  return (
    <div className="history-container" style={{ maxWidth: "1000px" }}>
      <h2>Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>User ID:</strong> {profile.user_id}</p>
        <p><strong>Department:</strong> {profile.department}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Role:</strong> {String(profile.role).toUpperCase()}</p>

        <br />

        <a href="/change-password" className="change-btn">
          <strong>Change Password</strong>
        </a>
      </div>

      <br />

      <div className="leave-balance-card">
        <h3>Leave Balance</h3>
        <p><strong>CL Remaining:</strong> {leaveBalance.casual_total - leaveBalance.casual_used}</p>
        <p><strong>EL Remaining:</strong> {leaveBalance.earned_total - leaveBalance.earned_used}</p>
        <p><strong>RH Remaining:</strong> {leaveBalance.rh_total - leaveBalance.rh_used}</p>
      </div>
    </div>
  );
};

export default Profile;
