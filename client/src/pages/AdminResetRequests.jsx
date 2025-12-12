import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { formatDate } from "../utils/dateFormatter";
import { useNavigate } from "react-router-dom";

const AdminResetRequests = () => {
  const [pending, setPending] = useState([]);
  const navigate = useNavigate();   // <-- FIX

  const load = async () => {
    const res = await axios.get("/admin/reset-requests");
    setPending(res.data.requests);
  };

  const goToReset = (uid) => {
    navigate(`/admin/reset-password/${uid}`);  // <-- Now works
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="history-container">
      <h2>Password Reset Requests</h2>

      {pending.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Requested At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {pending.map((p) => (
              <tr key={p.user_id}>
                <td>{p.user_id}</td>
                <td>{p.email}</td>
                <td>{formatDate(p.created_at)}</td>
                <td>
                  <button
                    onClick={() => goToReset(p.user_id)}
                    className="change-btn"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminResetRequests;
