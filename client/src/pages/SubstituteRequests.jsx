import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import "../App.css";

const SubstituteRequests = () => {
  const [requests, setRequests] = useState([]);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB");
  };

  const loadRequests = async () => {
    try {
      const res = await axios.get("/api/substitute/requests", {
        withCredentials: true, // SESSION-BASED
      });

      const pending = (res.data.requests || []).filter(
        (r) => r.substitute_status === "pending"
      );

      setRequests(pending);
    } catch (err) {
      console.error("Failed to load substitute requests", err);
      setRequests([]);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      await axios.post(
        `/api/substitute/accept/${id}`,
        {},
        { withCredentials: true }
      );
      loadRequests();
    } catch (err) {
      alert("Error accepting request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `/api/substitute/reject/${id}`,
        {},
        { withCredentials: true }
      );
      loadRequests();
    } catch (err) {
      alert("Error rejecting request");
    }
  };

  return (
    <div className="history-container">
      <h2>Substitute Requests</h2>

      {requests.length ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Start</th>
                <th>End</th>
                <th>Arrangement Details</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.arrangement_id}>
                  <td>{r.arrangement_id}</td>
                  <td>{r.requester_name}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>

                  {/* FIXED: Now uses new schema column: details */}
                  <td>{r.details || "—"}</td>

                  <td>
                    <button
                      className="action-accept"
                      onClick={() => handleAccept(r.arrangement_id)}
                    >
                      Accept
                    </button>
                    {" | "}
                    <button
                      className="action-reject"
                      onClick={() => handleReject(r.arrangement_id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-records">
          <p>No substitute requests.</p>
        </div>
      )}
    </div>
  );
};

export default SubstituteRequests;
