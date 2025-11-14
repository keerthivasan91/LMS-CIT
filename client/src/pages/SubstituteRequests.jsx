import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import "../App.css";
import { formatDate } from "../utils/dateFormatter";

const SubstituteRequests = () => {
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem("token"); // FIXED: read token
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB");  // 28/02/2025
  };



  const loadRequests = async () => {
    try {
      const res = await axios.get("/api/substitute/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequests(res.data.requests || []); // FIXED
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
      await axios.post(`/api/substitute/accept/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadRequests();
    } catch (err) {
      alert("Error accepting request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/substitute/reject/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
                <th>Status</th>
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
                  <td>{r.status}</td>
                  <td>
                    {r.status === "pending" ? (
                      <>
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
                      </>
                    ) : "Responded"}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      ) : (
        <div className="no-records"><p>No substitute requests.</p></div>
      )}
    </div>
  );
};

export default SubstituteRequests;
