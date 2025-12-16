import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isPrincipal } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const PrincipalApprovals = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!isPrincipal(user)) {
      window.location.href = "/dashboard";
      return;
    }
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    try {
      const res = await axios.get("/admin/requests");
      setRequests(res.data.requests || []);
    } catch {
      setRequests([]);
    }
  };

  const approve = async (id) => {
    await axios.post(`/admin/approve/${id}`);
    loadRequests();
  };

  const reject = async (id) => {
    await axios.post(`/admin/reject/${id}`);
    loadRequests();
  };

  return (
    <div className="history-container">
      <h2>Principal Approvals</h2>
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
              <th>HOD Status</th>
              <th>Principal Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r.leave_id}>
                <td>{r.leave_id}</td>
                <td>{r.requester_name}</td>
                <td>{r.department_code}</td>
                <td>{r.leave_type}</td>
                <td>{formatDate(r.start_date)}</td>
                <td>{formatDate(r.end_date)}</td>
                <td>{r.days}</td>
                <td>{r.hod_status}</td>
                <td>{r.principal_status}</td>

                <td>
                  {r.principal_status === "pending" ? (
                    <>
                      <button className="action-accept" onClick={() => approve(r.leave_id)}>
                        Approve
                      </button>
                      {" | "}
                      <button className="action-reject" onClick={() => reject(r.leave_id)}>
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
      ) : (
        <div className="no-requests"><p>No requests.</p></div>
      )}
    </div>
  );
};

export default PrincipalApprovals;
