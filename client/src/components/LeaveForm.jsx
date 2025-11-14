import React from "react";
import "../App.css";

const LeaveForm = ({
  form,
  onChange,
  onSubmit,
  role,
  facultyList = [],
  departments = [],
  staffList = []
}) => {
  return (
    <form onSubmit={onSubmit}>
      <label>Leave Type</label>
      <select name="leave_type" value={form.leave_type} onChange={onChange} required>
        <option>Casual Leave</option>
        <option>Earned Leave</option>
        <option>OOD</option>
        <option>Permitted Leave</option>
        <option>Special Casual Leave</option>
        <option>Loss of Pay Leave</option>
        <option>Compensatory Off Leave</option>
      </select>

      <label>Start Date</label>
      <input
        type="date"
        name="start_date"
        value={form.start_date}
        onChange={onChange}
        required
      />

      <label>Start Session</label>
      <select
        name="start_session"
        value={form.start_session}
        onChange={onChange}
        required
      >
        <option>Forenoon</option>
        <option>Afternoon</option>
      </select>

      <label>End Date</label>
      <input
        type="date"
        name="end_date"
        value={form.end_date}
        onChange={onChange}
        required
      />

      <label>End Session</label>
      <select
        name="end_session"
        value={form.end_session}
        onChange={onChange}
        required
      >
        <option>Forenoon</option>
        <option>Afternoon</option>
      </select>


      <label>Reason</label>
      <textarea
        name="reason"
        value={form.reason}
        onChange={onChange}
        placeholder="Enter reason for leave"
        required
      ></textarea>

      {/* STAFF substitute selection */}
      {role === "staff" && (
        <>
          <label>Select Substitute Staff (Optional)</label>
          <select
            name="substitute_user_id"
            value={form.substitute_user_id}
            onChange={onChange}
          >
            <option value="">-- None --</option>
            {facultyList.map((f) => (
              <option key={f.user_id} value={f.user_id}>
                {f.name} ({f.department})
              </option>
            ))}
          </select>
        </>
      )}

      {/* FACULTY & HOD substitute logic */}
      {role !== "staff" && role !== "admin" && (
        <>
          <label>Alternate Arrangements Made</label>
          <textarea
            name="alternate"
            value={form.alternate}
            onChange={onChange}
            placeholder="Mention alternate arrangements"
            required
          ></textarea>

          <label>Department for Substitute</label>
          <select
            name="department_select"
            value={form.department_select}
            onChange={onChange}
          >
            <option value="">-- Select Department --</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <label>Substitute Faculty (Optional)</label>
          <select
            name="substitute_user_id"
            value={form.substitute_user_id}
            onChange={onChange}
          >
            <option value="">-- None --</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </>
      )}

      <button type="submit">Submit Application</button>
    </form>
  );
};

export default LeaveForm;
