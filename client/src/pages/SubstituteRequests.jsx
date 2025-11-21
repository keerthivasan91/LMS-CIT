import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import "../App.css";

const SubstituteRequests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-GB");
  };

  const loadRequests = async () => {
    try {
      const res = await axios.get("/api/substitute/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(res.data.requests || []);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadRequests();
    } catch {
      alert("Error accepting request");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `/api/substitute/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadRequests();
    } catch {
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
                <th>Sub Status</th>
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
                  <td>{r.substitute_status}</td>

                  <td>
                    {r.substitute_status === "pending" ? (
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
                    ) : (
                      "Responded"
                    )}
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
