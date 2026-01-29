import React, { useMemo, useState, useEffect } from "react";
import "../App.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";


const LeaveForm = ({
  form,
  onChange,
  onSubmit,
  role,
  departments = [],
  staffList = [],
  facultyArr1 = [],
  facultyArr2 = [],
  facultyArr3 = [],
  facultyArr4 = []
}) => {

  /* ========================================
     BLOCKED DATES STATE + FETCH
  ======================================== */
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    fetch("/api/substitute/blocked-dates", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const disabled = [];

        data.forEach(r => {
          let d = new Date(r.start_date);
          const end = new Date(r.end_date);

          while (d <= end) {
            disabled.push(new Date(d));
            d.setDate(d.getDate() + 1);
          }
        });

        setBlockedDates(disabled);
      })
      .catch(err => console.error("Blocked dates fetch failed", err));
  }, []);

  /* ========================================
     DROPDOWN OPTIONS
  ======================================== */
  const staffOptions = useMemo(
    () =>
      staffList.map((s) => (
        <option key={s.user_id} value={s.user_id}>
          {s.name}
        </option>
      )),
    [staffList]
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      )),
    [departments]
  );
  function formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }


  /* ========================================
     RENDER
  ======================================== */
  return (
    <form onSubmit={onSubmit}>
      <p style={{ color: "red", fontSize: "15px" }}>
        ⛔ Leave cannot be applied on dates where substitution is accepted
      </p>
      {/* Leave Type */}
      <label>Leave Type</label>
      <select
        name="leave_type"
        value={form.leave_type}
        onChange={onChange}
        required
      >
        <option>Casual Leave</option>
        <option>Earned Leave</option>
        <option>OOD</option>
        <option>Special Casual Leave</option>
        <option>Loss of Pay</option>
        <option>Restricted Holiday</option>
        <option>Maternity Leave</option>
        <option>Vacation Leave</option>
      </select>

      {/* ================= DATES ================= */}

      <label>Start Date</label>
      <Flatpickr
        value={form.start_date ? new Date(form.start_date) : null}
        options={{
          dateFormat: "d-m-Y",
          minDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          disable: blockedDates
        }}
        onChange={([date]) =>
          onChange({
            target: {
              name: "start_date",
              value: formatLocalDate(date) // ✅ NO timezone shift
            }
          })
        }
      />



      <label>Start Session</label>
      <select
        name="start_session"
        value={form.start_session}
        onChange={onChange}
      >
        <option value="Forenoon">Forenoon</option>
        <option value="Afternoon">Afternoon</option>
      </select>

      <label>End Date</label>
      <Flatpickr
        value={form.end_date ? new Date(form.end_date) : null}
        options={{
          dateFormat: "d-m-Y",
          minDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          disable: blockedDates
        }}
        onChange={([date]) =>
          onChange({
            target: {
              name: "end_date",
              value: formatLocalDate(date)
            }
          })
        }
      />




      <label>End Session</label>
      <select
        name="end_session"
        value={form.end_session}
        onChange={onChange}
      >
        <option value="Forenoon">Forenoon</option>
        <option value="Afternoon">Afternoon</option>
      </select>

      {/* Reason */}
      <label>Reason</label>
      <textarea
        name="reason"
        value={form.reason}
        onChange={onChange}
        required
      />

      {/* ========================================
         ARRANGEMENTS SECTION
      ======================================== */}
      <h3>Alternate Arrangements Made</h3>

      <div className="arr-table">
        <div className="arr-row header">
          <div className="arr-col">#</div>

          {(role === "staff" || role === "admin") ? (
            <div className="arr-col">Substitute Staff</div>
          ) : role !== "principal" ? (
            <>
              <div className="arr-col">Department</div>
              <div className="arr-col">Substitute Faculty</div>
            </>
          ) : null}

          <div className="arr-col">Arrangement Details</div>
        </div>

        {[1, 2, 3, 4].map((i) => {
          const facultyListForRow =
            i === 1 ? facultyArr1 :
              i === 2 ? facultyArr2 :
                i === 3 ? facultyArr3 :
                  facultyArr4;

          return (
            <div className="arr-row" key={i}>
              <div className="arr-col">{i}</div>

              {(role === "staff" || role === "admin") && (
                <div className="arr-col">
                  <select
                    name={`arr${i}_staff`}
                    value={form[`arr${i}_staff`] || ""}
                    onChange={onChange}
                  >
                    <option value="">Choose...</option>
                    {staffOptions}
                  </select>
                </div>
              )}

              {role !== "staff" && role !== "admin" && (
                <>
                  <div className="arr-col">
                    <select
                      name={`arr${i}_dept`}
                      value={form[`arr${i}_dept`] || ""}
                      onChange={onChange}
                    >
                      <option value="">Choose Dept...</option>
                      {departmentOptions}
                    </select>
                  </div>

                  <div className="arr-col">
                    <select
                      name={`arr${i}_faculty`}
                      value={form[`arr${i}_faculty`] || ""}
                      onChange={onChange}
                    >
                      <option value="">Choose Faculty...</option>
                      {facultyListForRow.map((f) => (
                        <option key={f.user_id} value={f.user_id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="arr-col">
                <textarea
                  name={`arr${i}_details`}
                  value={form[`arr${i}_details`] || ""}
                  onChange={onChange}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button type="submit">Submit Application</button>
    </form>
  );
};

export default React.memo(LeaveForm);
