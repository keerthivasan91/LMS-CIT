import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isHOD } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";


const HODApproval = () => {
  const { user } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  // Protect page: Only HOD can access
  useEffect(() => {
    if (!isHOD(user)) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/hod/requests");
      setRequests(res.data?.requests || []);
      setDepartment(res.data?.department || user?.department || "");
    } catch (error) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/hod/approve/${id}`);
      loadRequests();
    } catch (error) {
      alert("Error approving request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/hod/reject/${id}`);
      loadRequests();
    } catch (error) {
      alert("Error rejecting request.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto" }}>
      <h2 style={{ color: "#333", marginBottom: "30px", textAlign: "center" }}>
        Approve Leave Requests ({department})
      </h2>

      {requests.length > 0 ? (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
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
                  <td>{r.type}</td>
                  <td>{formatDate(r.start_date)}</td>
                  <td>{formatDate(r.end_date)}</td>
                  <td>{r.days}</td>
                  <td>{r.substitute_name || "None"}</td>
                  <td>{r.sub_status}</td>
                  <td>{r.hod_status}</td>

                  <td>
                    {r.hod_status === "pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(r.leave_id)}
                        >
                          Approve
                        </button>
                        {" | "}
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(r.leave_id)}
                        >
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
        <div className="no-requests">
          <p>No requests for your department.</p>
        </div>
      )}
    </div>
  );
};

export default HODApproval;
