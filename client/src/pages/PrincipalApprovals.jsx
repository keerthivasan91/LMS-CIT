import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isAdmin } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const PrincipalApprovals = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isAdmin(user)) {
      window.location.href = "/dashboard";
      return;
    }
    loadRequests();
    // eslint-disable-next-line
  }, [user]);

  const loadRequests = async () => {
    try {
      const res = await axios.get("/principal/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load principal requests", err);
      setRequests([]);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/principal/approve/${id}`);
      await loadRequests();
    } catch (err) {
      alert("Error approving leave");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/principal/reject/${id}`);
      await loadRequests();
    } catch (err) {
      alert("Error rejecting leave");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2>Principal Approvals - All Leave Requests</h2>

      {requests.length ? (
        <table className="approval-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Requester</th>
              <th>Dept</th>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Days</th>
              <th>Substitute</th>
              <th>Sub Status</th>
              <th>HOD Status</th>
              <th>Principal Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.requester_name}</td>
                <td>{r.department}</td>
                <td>{r.leave_type}</td>
                <td>{formatDate(r.start_date)}</td>
                <td>{formatDate(r.end_date)}</td>
                <td>{r.days}</td>
                <td>{r.substitute_name || "None"}</td>
                <td>{r.sub_status}</td>
                <td>{r.hod_status}</td>
                <td>{r.principal_status}</td>
                <td>
                  {r.principal_status === "Pending" ? (
                    <>
                      <button className="approve-btn" onClick={() => handleApprove(r.id)}>Approve</button>
                      {" "}
                      <button className="reject-btn" onClick={() => handleReject(r.id)}>Reject</button>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-requests">
          <p>No requests found.</p>
        </div>
      )}
    </div>
  );
};

export default PrincipalApprovals;
