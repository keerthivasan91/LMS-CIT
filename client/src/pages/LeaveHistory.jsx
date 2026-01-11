import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isHOD, isAdmin, isFaculty, isPrincipal, isStaff } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const prettySession = (s) =>
  s?.toLowerCase().startsWith("f") ? "Forenoon" : "Afternoon";

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

  const loadData = async () => {
    try {
      // Send separate page markers to the backend
      const res = await axios.get(
        `/leave_history?appliedPage=${appliedPage}&deptPage=${deptPage}&instPage=${instPage}&limit=${limit}${selectedDept ? `&department=${selectedDept}` : ""}`
      );

      const data = res.data;

      // 1. Map Applied Leaves
      setApplied((data.applied_leaves || []).map(l => ({
        id: l.leave_id,
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

      // 2. Map Substitute Requests (No mapping logic change needed, just use name from backend)
      setSubstituteRequests((data.substitute_requests || []).map(r => ({
        id: r.leave_id,
        requester: r.requester_name,
        reason: r.reason,
        status: r.substitute_status,
        details: r.arrangement_details
      })));

      // 3. Map Dept Leaves
      setDeptLeaves((data.department_leaves || []).map(l => ({
        id: l.leave_id,
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
        id: l.leave_id,
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

  useEffect(() => {
    loadData();
  }, [appliedPage, deptPage, instPage, selectedDept]);

  // --- REUSABLE PAGINATION COMPONENT (UI REMAINS UNCHANGED) ---
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

      {/* ================= SUBSTITUTE REQUESTS (NO PAGINATION UI) ================= */}
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