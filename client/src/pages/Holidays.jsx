import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import "../App.css";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    holiday_id: null,
    date: "",
    name: ""
  });

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-GB");
  };

  const loadHolidays = async () => {
    const res = await axios.get("/holidays");
    setHolidays(res.data.holidays || []);
  };

  const loadUser = async () => {
    const res = await axios.get("/auth/me");
    setRole(res.data.user.role);
  };

  useEffect(() => {
    loadHolidays();
    loadUser();
  }, []);

  /* ================= ADMIN ACTIONS ================= */

  const submitHoliday = async () => {
    if (!form.date || !form.name) return;

    const payload = {
      date: form.date,
      name: form.name,
      description: null,
      academic_year: null
    };

    if (form.holiday_id) {
      await axios.put(`/holidays/${form.holiday_id}`, payload);
    } else {
      await axios.post("/holidays", payload);
    }

    setForm({ holiday_id: null, date: "", name: "" });
    loadHolidays();
  };

  const editHoliday = (h) => {
    setForm({
      holiday_id: h.holiday_id,
      date: h.date.split("T")[0],
      name: h.name
    });
  };

  const deleteHoliday = async () => {
    if (!selectedHoliday) return;

    try {
      setDeleting(true);
      await axios.delete(`/holidays/${selectedHoliday.holiday_id}`);
      setSelectedHoliday(null);
      loadHolidays();
    } catch (err) {
      console.error(err);
    }

    setDeleting(false);
  };

  const isAdmin = role === "admin";

  return (
    <div className="history-container" style={{ maxWidth: "800px" }}>
      <h2>Holiday Calendar</h2>

      {/* ADMIN FORM */}
      {isAdmin && (
        <div className="table-wrapper">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Holiday Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <button onClick={submitHoliday}>
            {form.holiday_id ? "Update" : "Add"}
          </button>
        </div>
      )}

      {/* CALENDAR TABLE */}
      {holidays.length > 0 ? (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {holidays.map((h) => (
                <tr key={h.holiday_id}>
                  <td>{formatDate(h.date)}</td>
                  <td>{h.name}</td>
                  {isAdmin && (
                    <td>
                      <button onClick={() => editHoliday(h)}>Edit</button>
                      <button onClick={() => setSelectedHoliday(h)}>
                        Delete
                      </button>
                    </td>
                  )}
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

      {/* DELETE CONFIRMATION POPUP */}
      {selectedHoliday && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete the holiday{" "}
              <b>{selectedHoliday.name}</b>?
            </p>

            <button
              onClick={deleteHoliday}
              disabled={deleting}
              className="delete-btn full-btn"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </button>

            <button
              onClick={() => setSelectedHoliday(null)}
              className="cancel-btn full-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
