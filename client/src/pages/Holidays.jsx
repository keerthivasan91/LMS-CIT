import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import "../App.css";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB");  // 28/02/2025
  };



  const loadHolidays = async () => {
    try {
      const res = await axios.get("/holidays");
      setHolidays(res.data.holidays || []);
    } catch (error) {
      setHolidays([]);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  return (
    <div className="history-container" style={{ maxWidth: "800px" }}>
      <h2>Holiday Calendar</h2>

      {holidays.length > 0 ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday</th>
              </tr>
            </thead>

            <tbody>
              {holidays.map((h, index) => (
                <tr key={index}>
                  <td>{formatDate(h.date)}</td>
                  <td>{h.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-records">
          <p>No holidays added.</p>
        </div>
      )}
    </div>
  );
};

export default Holidays;
