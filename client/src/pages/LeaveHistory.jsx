import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isHOD, isAdmin, isFaculty, isPrincipal, isStaff } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const prettySession = (s) =>
  s?.toLowerCase().startsWith("f") ? "Forenoon" : "Afternoon";

// Reusable Error Popup Component
const ErrorPopup = ({ message, onClose }) => {
  if (!message) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#dc3545' }}>Validation Error</h3>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <button 
          onClick={onClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const LeaveHistory = () => {
  const { user } = useContext(AuthContext);

  const [applied, setApplied] = useState([]);
  const [substituteRequests, setSubstituteRequests] = useState([]);
  const [deptLeaves, setDeptLeaves] = useState([]);
  const [institutionLeaves, setInstitutionLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  // --- INDEPENDENT PAGINATION STATES ---
  const [appliedPage, setAppliedPage] = useState(1);
  const [deptPage, setDeptPage] = useState(1);
  const [instPage, setInstPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState({ applied: 0, dept: 0, inst: 0 });

  const [docType, setDocType] = useState("pdf");
  const [downloadDept, setDownloadDept] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      // Send separate page markers to the backend
      const res = await axios.get(
        `/leave_history?appliedPage=${appliedPage}&deptPage=${deptPage}&instPage=${instPage}&limit=${limit}${selectedDept ? `&department=${selectedDept}` : ""}`
      );

      const data = res.data;

      // 1. Map Applied Leaves
      setApplied((data.applied_leaves || []).map(l => ({
        id: l.user_id,
        type: l.leave_type,
        start_date: l.start_date,
        start_session: prettySession(l.start_session),
        end_date: l.end_date,
        end_session: prettySession(l.end_session),
        days: l.days,
        sub_status: l.final_substitute_status,
        hod_status: l.hod_status,
        principal_status: l.principal_status,
        final_status: l.final_status,
        applied_on: l.applied_on,
        reason: l.reason
      })));

      // 2. Map Substitute Requests
      setSubstituteRequests((data.substitute_requests || []).map(r => ({
        id: r.user_id,
        requester: r.requester_name,
        reason: r.reason,
        status: r.substitute_status,
        details: r.arrangement_details
      })));

      // 3. Map Dept Leaves
      setDeptLeaves((data.department_leaves || []).map(l => ({
        id: l.user_id,
        requester: l.requester_name,
        designation: l.designation,
        type: l.leave_type,
        start_date: l.start_date,
        start_session: prettySession(l.start_session),
        end_date: l.end_date,
        end_session: prettySession(l.end_session),
        days: l.days,
        hod_status: l.hod_status,
        final_status: l.final_status,
        applied_on: l.applied_on
      })));

      // 4. Map Institution Leaves
      setInstitutionLeaves((data.institution_leaves || []).map(l => ({
        id: l.user_id,
        requester: l.requester_name,
        department: l.dept_alias || l.department_code,
        designation: l.designation,
        type: l.leave_type,
        start_date: l.start_date,
        start_session: prettySession(l.start_session),
        end_date: l.end_date,
        end_session: prettySession(l.end_session),
        days: l.days,
        final_status: l.final_status,
        applied_on: l.applied_on
      })));

      setDepartments(data.departments || []);
      setTotalPages({
        applied: data.pagination.applied_total_pages,
        dept: data.pagination.dept_total_pages,
        inst: data.pagination.inst_total_pages
      });

    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // Date range validation function
  const validateDateRange = () => {
    if (!startDate || !endDate) {
      setErrorMessage("Please select both start and end date");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if end date is before start date
    if (end < start) {
      setErrorMessage("End date cannot be before start date");
      return false;
    }

    // Check if range exceeds 1 year (365 days)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 365) {
      setErrorMessage("Date range cannot exceed 1 year (365 days)");
      return false;
    }

    return true;
  };

  const downloadLeaveHistory = () => {
    if (!validateDateRange()) {
      return;
    }

    // Encode query parameters for safe URL construction
    const params = new URLSearchParams({
      docType: docType,
      department: downloadDept,
      startDate: startDate,
      endDate: endDate
    });

    const url = `/api/leave-history/download?${params.toString()}`;

    // Opens file download in new tab
    window.open(url, "_blank");
  };

  // Check if download button should be disabled
  const isDownloadDisabled =
  !startDate ||
  !endDate ||
  new Date(endDate) < new Date(startDate);

  useEffect(() => {
    loadData();
  }, [appliedPage, deptPage, instPage, selectedDept]);

  // --- REUSABLE PAGINATION COMPONENT ---
  const SectionPagination = ({ currentPage, total, onPageChange }) => {
    if (total <= 1) return null;
    return (
      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-pagination"
        >
          Previous
        </button>
        <span className="page-info">
          Page <strong>{currentPage}</strong> of <strong>{total}</strong>
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === total}
          className="btn-pagination"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="history-container">
      <h2>Leave History</h2>

      {/* Error Popup */}
      <ErrorPopup message={errorMessage} onClose={() => setErrorMessage("")} />

      {/* ================= USER APPLIED LEAVES ================= */}
      {user && user.role !== "admin" && (
        <>
          <h3 style={{ marginTop: 30, color: "#667eea" }}>Leaves You Applied</h3>
          {applied.length ? (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Type</th><th>Start</th><th>End</th><th>Days</th>
                    <th>Sub Status</th><th>HOD</th><th>Principal</th><th>Final</th>
                    <th>Reason</th><th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applied.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td><td>{l.type}</td>
                      <td>{formatDate(l.start_date)} ({l.start_session})</td>
                      <td>{formatDate(l.end_date)} ({l.end_session})</td>
                      <td>{l.days}</td>
                      <td>{l.sub_status}</td><td>{l.hod_status}</td>
                      <td>{l.principal_status}</td><td>{l.final_status}</td>
                      <td>{l.reason}</td><td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SectionPagination
                currentPage={appliedPage}
                total={totalPages.applied}
                onPageChange={setAppliedPage}
              />
            </div>
          ) : (
            <div className="no-records"><p>No leave records found.</p></div>
          )}
        </>
      )}

      {/* ================= SUBSTITUTE REQUESTS ================= */}
      {(isFaculty(user) || isStaff(user) || isAdmin(user)) && substituteRequests.length > 0 && (
        <>
          <h3 style={{ marginTop: 40, color: "#28a745" }}>Substitute Requests Assigned to You</h3>
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th><th>Requester</th><th>Reason</th><th>Arrangement Details</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {substituteRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td><td>{r.requester}</td>
                    <td>{r.reason}</td><td>{r.details || "—"}</td><td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= HOD DEPARTMENT LEAVE HISTORY ================= */}
      {isHOD(user) && (
        <>
          <h3 style={{ marginTop: 40, color: "#667eea" }}>Department Leave History</h3>
          {deptLeaves.length ? (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Requester</th><th>Designation</th><th>Type</th>
                    <th>Start</th><th>End</th><th>Days</th><th>Final</th><th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {deptLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td><td>{l.requester}</td><td>{l.designation}</td><td>{l.type}</td>
                      <td>{formatDate(l.start_date)} ({l.start_session})</td>
                      <td>{formatDate(l.end_date)} ({l.end_session})</td>
                      <td>{l.days}</td><td>{l.final_status}</td><td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SectionPagination
                currentPage={deptPage}
                total={totalPages.dept}
                onPageChange={setDeptPage}
              />
            </div>
          ) : (
            <div className="no-records"><p>No department leave records found.</p></div>
          )}
        </>
      )}

      {/* ================= ADMIN / PRINCIPAL – INSTITUTION LEAVES ================= */}
      {(isAdmin(user) || isPrincipal(user)) && (
        <>
          <h3 style={{ marginTop: 40, color: "#6f42c1" }}>Institution Leave History</h3>
          {/* ================= DOWNLOAD FILTERS ================= */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <select value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>

            <select value={downloadDept} onChange={e => setDownloadDept(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

            <button 
              onClick={downloadLeaveHistory} 
              disabled={isDownloadDisabled}
              className="action-accept"
              style={{
                opacity: isDownloadDisabled ? 0.5 : 1,
                cursor: isDownloadDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              Download
            </button>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Filter by Department:</label>
            <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setInstPage(1); }} style={{ marginLeft: 10, padding: "5px 8px" }}>
              <option value="">All Departments</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          {institutionLeaves.length ? (
            <div className="table-wrapper">
              <table className="history-table" style={{ minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th>ID</th><th>Requester</th><th>Department</th><th>Designation</th><th>Type</th>
                    <th>Start</th><th>End</th><th>Days</th><th>Final Status</th><th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td><td>{l.requester}</td><td>{l.department}</td><td>{l.designation}</td><td>{l.type}</td>
                      <td>{formatDate(l.start_date)}</td><td>{formatDate(l.end_date)}</td><td>{l.days}</td>
                      <td>{l.final_status}</td><td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SectionPagination
                currentPage={instPage}
                total={totalPages.inst}
                onPageChange={setInstPage}
              />
            </div>
          ) : (
            <div className="no-records"><p>No institution leave records found.</p></div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveHistory;