import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { isHOD, isAdmin, isFaculty, isPrincipal, isStaff } from "../utils/roles";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

/* -----------------------------------------------------------
   Convert FN/AN/Forenoon/Afternoon into clean labels
----------------------------------------------------------- */
const prettySession = (s) =>
  s?.toLowerCase().startsWith("f") ? "Forenoon" : "Afternoon";

const LeaveHistory = () => {
  const { user, token } = useContext(AuthContext);

  const [applied, setApplied] = useState([]);
  const [substituteRequests, setSubstituteRequests] = useState([]);
  const [deptLeaves, setDeptLeaves] = useState([]);
  const [institutionLeaves, setInstitutionLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  /* -----------------------------------------------------------
     Load all leave history (user / HOD / admin)
  ----------------------------------------------------------- */
  const loadAll = async (dept = "") => {
    try {
      const res = await axios.get(
        `/leave_history${dept ? `?department=${dept}` : ""}`
      );

      /* ---------------------- Applied Leaves ---------------------- */
      const mapApplied = (list) =>
        list.map((l) => ({
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
          reason: l.reason,
          arrangement_details: l.arrangement_details || null
        }));

      /* ---------------------- Substitute Requests ---------------------- */
      const mapSubReq = (list) =>
        list.map((r) => ({
          id: r.leave_id,
          requester: r.requester_name,
          days: r.days,
          arrangement_details: r.arrangement_details || null,
          status: r.substitute_status
        }));

      /* ---------------------- Department Leaves (HOD) ---------------------- */
      const mapDept = (list) =>
        list.map((l) => ({
          id: l.leave_id,
          requester: l.requester_name,
          designation: l.designation,
          type: l.leave_type,
          start_date: l.start_date,
          start_session: prettySession(l.start_session),
          end_date: l.end_date,
          end_session: prettySession(l.end_session),
          days: l.days,
          substitute: l.substitute_name,
          sub_status: l.final_substitute_status,
          hod_status: l.hod_status,
          principal_status: l.principal_status,
          final_status: l.final_status,
          applied_on: l.applied_on,
          reason: l.reason,
          arrangement_details: l.arrangement_details || null
        }));

      /* ---------------------- Institution Leaves ---------------------- */
      const mapInstitution = (list) =>
        list.map((l) => ({
          id: l.user_id,
          requester: l.requester_name,
          department: l.department_code,
          designation: l.designation,
          type: l.leave_type,
          start_date: l.start_date,
          start_session: prettySession(l.start_session),
          end_date: l.end_date,
          end_session: prettySession(l.end_session),
          days: l.days,
          substitute: l.substitute_name,
          sub_status: l.final_substitute_status,
          hod_status: l.hod_status,
          principal_status: l.principal_status,
          final_status: l.final_status,
          applied_on: l.applied_on,
          reason: l.reason,
          arrangement_details: l.arrangement_details || null
        }));

      setApplied(mapApplied(res.data.applied_leaves || []));
      setSubstituteRequests(mapSubReq(res.data.substitute_requests || []));
      setDeptLeaves(mapDept(res.data.department_leaves || []));
      setInstitutionLeaves(mapInstitution(res.data.institution_leaves || []));
      setDepartments(res.data.departments || []);
      setSelectedDept(res.data.selected_department || dept || "");

    } catch (err) {
      console.error("Failed to load history", err);
      setApplied([]);
      setSubstituteRequests([]);
      setDeptLeaves([]);
      setInstitutionLeaves([]);
      setDepartments([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeptFilter = async (e) => {
    const dept = e.target.value;
    setSelectedDept(dept);
    await loadAll(dept);
  };

  return (
    <div className="history-container">
      <h2>Leave History</h2>

      {/* ===========================================================
          USER APPLIED LEAVES
      =========================================================== */}
      {user && user.role !== "principal" && (
        <>
          <h3 style={{ marginTop: 30, color: "#667eea" }}>
            Leaves You Applied
          </h3>

          {applied.length ? (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Type</th>
                    <th>Start</th><th>Session</th>
                    <th>End</th><th>Session</th>
                    <th>Days</th><th>Substitute</th>
                    <th>Final Sub Status</th><th>HOD</th>
                    <th>Principal</th><th>Final</th>
                    <th>Reason</th>
                    <th>Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {applied.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.type}</td>

                      <td>{formatDate(l.start_date)}</td>
                      <td>{l.start_session}</td>

                      <td>{formatDate(l.end_date)}</td>
                      <td>{l.end_session}</td>

                      <td>{l.days}</td>
                      <td>{l.substitute || "None"}</td>

                      <td>{l.sub_status}</td>
                      <td>{l.hod_status}</td>
                      <td>{l.principal_status}</td>
                      <td>{l.final_status}</td>

                      <td>{l.reason}</td>

                      <td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-records"><p>No leave records found.</p></div>
          )}
        </>
      )}

      {/* ===========================================================
          SUBSTITUTE REQUESTS
      =========================================================== */}
      {(isFaculty(user) || isStaff(user) || isAdmin(user)) && substituteRequests.length > 0 && (
        <>
          <h3 style={{ marginTop: 40, color: "#28a745" }}>
            Substitute Requests Assigned to You
          </h3>

          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>ID</th><th>Requester</th>
                  <th>Arrangement Details</th><th>Status</th>
                </tr>
              </thead>

              <tbody>
                {substituteRequests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.requester}</td>
                    <td>{r.arrangement_details || "—"}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===========================================================
          HOD DEPARTMENT LEAVE HISTORY
      =========================================================== */}
      {isHOD(user) && (
        <>
          <h3 style={{ marginTop: 40, color: "#667eea" }}>
            Department Leave History
          </h3>

          {deptLeaves.length ? (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Requester</th>
                    <th>Designation</th><th>Type</th>
                    <th>Start</th><th>Session</th>
                    <th>End</th><th>Session</th>
                    <th>Days</th>
                    <th>Sub Status</th><th>HOD</th>
                    <th>Principal</th><th>Final</th>
                    <th>Reason</th>
                    <th>Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {deptLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.requester}</td>
                      <td>{l.designation}</td>
                      <td>{l.type}</td>

                      <td>{formatDate(l.start_date)}</td>
                      <td>{l.start_session}</td>

                      <td>{formatDate(l.end_date)}</td>
                      <td>{l.end_session}</td>

                      <td>{l.days}</td>

                      <td>{l.sub_status}</td>
                      <td>{l.hod_status}</td>
                      <td>{l.principal_status}</td>
                      <td>{l.final_status}</td>

                      <td>{l.reason}</td>

                      <td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-records"><p>No department leave records found.</p></div>
          )}
        </>
      )}

      {/* ===========================================================
          ADMIN / PRINCIPAL – INSTITUTION LEAVES
      =========================================================== */}
      {(isAdmin(user) || isPrincipal(user)) && (
        <>
          <h3 style={{ marginTop: 40, color: "#6f42c1" }}>
            Institution Leave History
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label>Filter by Department:</label>
            <select
              value={selectedDept}
              onChange={handleDeptFilter}
              style={{ marginLeft: 10, padding: "5px 8px" }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {institutionLeaves.length ? (
            <div className="table-wrapper">
              <table className="history-table" style={{ minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th>ID</th><th>Requester</th><th>Department</th><th>Designation</th><th>Type</th>
                    <th>Start</th><th>Session</th>
                    <th>End</th><th>Session</th>
                    <th>Days</th>
                    <th>Principal</th><th>Final</th>
                    <th>Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {institutionLeaves.map((l) => (
                    <tr key={l.id}>
                      <td>{l.id}</td>
                      <td>{l.requester}</td>
                      <td>{l.department}</td>
                      <td>{l.designation}</td>
                      <td>{l.type}</td>

                      <td>{formatDate(l.start_date)}</td>
                      <td>{l.start_session}</td>

                      <td>{formatDate(l.end_date)}</td>
                      <td>{l.end_session}</td>

                      <td>{l.days}</td>
                      <td>{l.principal_status}</td>
                      <td>{l.final_status}</td>


                      <td>{formatDate(l.applied_on)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
