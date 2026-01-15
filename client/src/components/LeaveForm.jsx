import React, { useMemo } from "react";
import "../App.css";

const LeaveForm = ({
  form,
  onChange,
  onSubmit,
  role,
  departments = [],
  staffList = [],

  // NEW props (correct row-wise lists)
  facultyArr1 = [],
  facultyArr2 = [],
  facultyArr3 = [],
  facultyArr4 = []
}) => {

  // Staff dropdown list
  const staffOptions = useMemo(
    () =>
      staffList.map((s) => (
        <option key={s.user_id} value={s.user_id}>
          {s.name}
        </option>
      )),
    [staffList]
  );

  // Department dropdown list
  const departmentOptions = useMemo(
    () =>
      departments.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      )),
    [departments]
  );

  return (
    <form onSubmit={onSubmit}>

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

      {/* Dates */}
      <label>Start Date</label>
      <input
        type="date"
        name="start_date"
        value={form.start_date}
        onChange={onChange}
        required
        min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]}
      />

      <label>Start Session</label>
      <select name="start_session" value={form.start_session} onChange={onChange}>
        <option value="Forenoon">Forenoon</option>
        <option value="Afternoon">Afternoon</option>
      </select>

      <label>End Date</label>
      <input
        type="date"
        name="end_date"
        value={form.end_date}
        onChange={onChange}
        required
        min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]}
      />

      <label>End Session</label>
      <select name="end_session" value={form.end_session} onChange={onChange}>
        <option value="Forenoon">Forenoon</option>
        <option value="Afternoon">Afternoon</option>
      </select>

      {/* Reason */}
      <label>Reason</label>
      <textarea
        name="reason"
        value={form.reason}
        onChange={onChange}
        placeholder="Enter reason for leave"
        required
      />

      {/* ======================================== */}
      {/*         ARRANGEMENTS SECTION             */}
      {/* ======================================== */}
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

        {/* ---------------- ROWS 1–4 ---------------- */}
        {[1, 2, 3, 4].map((i) => {
          // Select the correct faculty list per row
          const facultyListForRow =
            i === 1 ? facultyArr1 :
            i === 2 ? facultyArr2 :
            i === 3 ? facultyArr3 :
                      facultyArr4;

          return (
            <div className="arr-row" key={i}>
              <div className="arr-col">{i}</div>

              {/* STAFF MODE */}
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

              {/* FACULTY / HOD MODE */}
              {role !== "staff" && role !== "admin" && (
                <>
                  {/* Department */}
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

                  {/* Substitute Faculty */}
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

              {/* Arrangement Details */}
              <div className="arr-col">
                <textarea
                  name={`arr${i}_details`}
                  value={form[`arr${i}_details`] || ""}
                  onChange={onChange}
                  placeholder="Enter arrangement details..."
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
