import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await axios.get(`/admin/users/${userId}`);
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="history-container">
      {/* Back Button */}
      <button
        className="btn-pagination"
        style={{ marginBottom: 15 }}
        onClick={() => navigate(-1)}
      >
        ← Back to Users
      </button>

      <h2>User Profile</h2>

      <table className="history-table">
        <tbody>
          <tr><td>User ID</td><td>{user.user_id}</td></tr>
          <tr><td>Name</td><td>{user.name}</td></tr>
          <tr><td>Email</td><td>{user.email}</td></tr>
          <tr><td>Role</td><td>{user.role}</td></tr>
          <tr><td>Department</td><td>{user.department_name || "-"}</td></tr>
          <tr><td>Designation</td><td>{user.designation || "-"}</td></tr>
          <tr><td>Date Joined</td><td>{user.date_joined}</td></tr>
          <tr><td>Status</td><td>{user.is_active ? "Active" : "Inactive"}</td></tr>
          <tr><td>CL Remaining</td><td>{user.casual_total - user.casual_used}</td></tr>
          <tr><td>EL Remaining</td><td>{user.earned_total - user.earned_used}</td></tr>
          <tr><td>RH Remaining</td><td>{user.rh_total - user.rh_used}</td></tr>
          <tr><td>VL Remaining</td><td>{user.vl_total - user.vl_used}</td></tr>
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserProfile;
