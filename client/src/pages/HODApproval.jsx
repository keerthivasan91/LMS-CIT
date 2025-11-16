import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isHOD } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const HODApproval = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHOD(user)) window.location.href = "/dashboard";
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/hod/requests");
      setRequests(res.data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = async (id) => {
    await axios.post(`/api/hod/approve/${id}`);
    loadRequests();
  };

  const reject = async (id) => {
    await axios.post(`/api/hod/reject/${id}`);
    loadRequests();
  };

  return (
    <div className="history-container">
      <h2>HOD Approval</h2>

      {requests.length ? (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Substitute</th>
                <th>Sub Status</th>
                <th>HOD Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.leave_id}>
                  <td>{r.leave_id}</td>
                  <td>{r.requester_name}</td>
                  <td>{r.leave_type}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.substitute_name || "None"}</td>
                  <td>{r.substitute_status}</td>
                  <td>{r.hod_status}</td>

                  <td>
                    {r.hod_status === "pending" ? (
                      <>
                        <button className="approve-btn" onClick={() => approve(r.leave_id)}>
                          Approve
                        </button>
                        {" | "}
                        <button className="reject-btn" onClick={() => reject(r.leave_id)}>
                          Reject
                        </button>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-requests"><p>No requests.</p></div>
      )}
    </div>
  );
};

export default HODApproval;
