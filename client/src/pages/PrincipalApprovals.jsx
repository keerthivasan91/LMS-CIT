import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isPrincipal } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const PrincipalApprovals = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

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
      setSelectedIds([]);
    } catch {
      setRequests([]);
    }
  };

  /* ================= CHECKBOX LOGIC ================= */

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(requests.map(r => r.leave_id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  /* ================= BULK ACTIONS ================= */

  const bulkApprove = async () => {
    if (!selectedIds.length) return;
    await axios.post("/admin/approve-bulk", { leaveIds: selectedIds });
    loadRequests();
  };

  const bulkReject = async () => {
    if (!selectedIds.length) return;
    await axios.post("/admin/reject-bulk", { leaveIds: selectedIds });
    loadRequests();
  };

  /* ================= SINGLE ACTIONS (UNCHANGED) ================= */

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
      <h2>Principal Approvals</h2><br></br>

      {requests.length ? (
        <>
          {/* ===== BULK ACTION BAR ===== */}
          {selectedIds.length > 0 && (
            <div style={{ marginBottom: 12, display: "flex", gap: 10 }}>
              <button
                className="action-accept"
                onClick={bulkApprove}
              >
                Approve Selected
              </button>

              <button
                className="action-reject"
                onClick={bulkReject}
              >
                Reject Selected
              </button>
            </div>
          )}


          <table className="approval-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      requests.length > 0 &&
                      selectedIds.length === requests.length
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th>ID</th>
                <th>Requester</th>
                <th>Dept</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Days</th>
                <th>HOD</th>
                <th>Principal</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr key={r.leave_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.leave_id)}
                      onChange={() => toggleOne(r.leave_id)}
                    />
                  </td>

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
                        <button
                          className="action-accept"
                          onClick={() => approve(r.leave_id)}
                        >
                          Approve
                        </button>
                        {" "}
                        <button
                          className="action-reject"
                          onClick={() => reject(r.leave_id)}
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
        </>
      ) : (
        <div className="no-requests"><p>No requests.</p></div>
      )}
    </div>
  );
};

export default PrincipalApprovals;
