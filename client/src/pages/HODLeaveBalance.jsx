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
      const res = await axios.get("/hod/leave_balance");

      setLeaveBalances(res.data.leave_balances || []);
      setDepartment(user?.department_code || "");
    } catch (error) {
      console.error("Leave balance fetch error:", error);
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
                <th>Faculty</th><th>Designation</th>
                <th>Casual (Used / Total)</th>
                <th>Earned (Used / Total)</th>
                <th>RH (Used / Total)</th>
                <th>Remaining (Total)</th>
              </tr>
            </thead>

            <tbody>
              {leaveBalances.map((lb, index) => (
                <tr key={index}>
                  <td>{lb.name}</td>
                  <td>{lb.designation}</td>

                  <td>
                    {lb.casual_used} / {lb.casual_total}
                  </td>

                  <td>
                    {lb.earned_used} / {lb.earned_total}
                  </td>

                  <td>
                    {lb.rh_used} / {lb.rh_total}
                  </td>

                  <td>
                    {lb.casual_remaining +
                      lb.rh_remaining +
                      lb.earned_remaining}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-requests">
          <p>No leave balance records found.</p>
        </div>
      )}
    </div>
  );
};

export default HODLeaveBalance;
