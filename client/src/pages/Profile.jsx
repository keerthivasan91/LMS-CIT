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

  // Load profile from backend (optional, if context doesn’t contain everything)
  const loadProfile = async () => {
      setProfile({
        name: user?.name || "",
        user_id: user?.user_id || "",
        department: user?.department_code || "",
        email: user?.email || "",
        phone: user?.phone || "",
        role: user?.role || "",
      });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="history-container" style={{ maxWidth: "800px" }}>
      <h2>Profile</h2>

      <div className="profile-card">
        <div className="profile-photo">
          <div className="img-placeholder">
            <img src="/profile-placeholder.png" alt="Profile" />
          </div>
        </div>

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
    </div>
  );
};

export default Profile;
