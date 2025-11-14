import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import "../App.css";


const HODLeaveBalance = () => {
  const { user } = useContext(AuthContext);

  const [leaveBalances, setLeaveBalances] = useState([]);
  const [department, setDepartment] = useState("");

  const loadData = async () => {
    try {
      const res = await axios.get("/hod/leave-balance"); // backend endpoint required
      setLeaveBalances(res.data.leave_balances || []);
      setDepartment(res.data.department || user?.department || "");
    } catch (error) {
      setLeaveBalances([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "30px auto" }}>
      <h2 style={{ color: "#333", marginBottom: "20px", textAlign: "center" }}>
        Leave Balance - {department}
      </h2>

      {leaveBalances.length > 0 ? (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Total Applications</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Pending</th>
                <th>Total Days Taken</th>
              </tr>
            </thead>

            <tbody>
              {leaveBalances.map((lb, index) => (
                <tr key={index}>
                  <td>{lb.name}</td>
                  <td>{lb.total || 0}</td>
                  <td>{lb.approved || 0}</td>
                  <td>{lb.rejected || 0}</td>
                  <td>{lb.pending || 0}</td>
                  <td>{lb.total_days || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-requests">
          <p>No leave records found for your department.</p>
        </div>
      )}
    </div>
  );
};

export default HODLeaveBalance;
