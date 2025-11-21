import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import LeaveForm from "../components/LeaveForm";
import "../App.css";

const ApplyLeave = () => {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "",
    start_session: "Forenoon",
    end_date: "",
    end_session: "Afternoon",
    reason: "",
    arrangement_details: "",
    substitute_user_id: "",
    department_select: "",
  });

  const [facultyList, setFacultyList] = useState([]);  // STAFF uses this
  const [departments, setDepartments] = useState([]);  // others
  const [staffList, setStaffList] = useState([]);      // substitutes for faculty/hod

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ------------------------------------------------------------
     1) STAFF → Load faculty substitutes from their own department
  ------------------------------------------------------------ */
  const loadFacultyForStaff = async () => {
    try {
      if (user?.role === "staff") {
        const branch = user.department_code;
        const res = await axios.get(`/api/staff/${branch}`);
        setFacultyList(res.data.staff || []);
      }
    } catch (err) {
      console.error("Failed to load faculty for staff", err);
    }
  };

  /* ------------------------------------------------------------
     2) FACULTY/HOD → Load departments
  ------------------------------------------------------------ */
  const loadDepartments = async () => {
    try {
      if (user?.role === "faculty" || user?.role === "hod") {
        const res = await axios.get(`/api/branches`);
        setDepartments(res.data.branches || []);
      }
    } catch (err) {
      console.error("Failed to load departments", err);
    }
  };

  /* ------------------------------------------------------------
     3) FACULTY/HOD → Load substitute faculty list when selecting a dept
  ------------------------------------------------------------ */
  const loadSubstituteFaculty = async () => {
    try {
      if (form.department_select) {
        const res = await axios.get(`/api/faculty/${form.department_select}`);
        setStaffList(res.data.faculty || []);
      } else {
        setStaffList([]);
      }
    } catch (err) {
      console.error("Failed to load substitute staff", err);
    }
  };

  /* ------------------------------------------------------------
     4) Submit leave request
  ------------------------------------------------------------ */
  const submitForm = async (e) => {
    e.preventDefault();

    const payload = {
      leave_type: form.leave_type,
      start_date: form.start_date,
      start_session: form.start_session,
      end_date: form.end_date,
      end_session: form.end_session,
      reason: form.reason,
      arrangement_details: form.arrangement_details,
      substitute_id: form.substitute_user_id || null,
    };

    try {
      await axios.post("/api/apply", payload);

      alert("Leave applied successfully");

      setForm({
        leave_type: "Casual Leave",
        start_date: "",
        start_session: "Forenoon",
        end_date: "",
        end_session: "Afternoon",
        reason: "",
        arrangement_details: "",
        substitute_user_id: "",
        department_select: "",
      });
    } catch (err) {
      console.error("Error submitting leave", err);
      alert("Error submitting leave");
    }
  };

  /* ------------------------------------------------------------
     5) Initial load
  ------------------------------------------------------------ */
  useEffect(() => {
    loadFacultyForStaff();
    loadDepartments();
  }, []);

  /* ------------------------------------------------------------
     6) Load substitute faculty when department changes
  ------------------------------------------------------------ */
  useEffect(() => {
    loadSubstituteFaculty();
  }, [form.department_select]);

  return (
    <div className="apply-leave-container">
      <div className="apply-leave-card">
        <h2>Apply for Leave</h2>
        <LeaveForm
          form={form}
          onChange={handleChange}
          onSubmit={submitForm}
          role={user.role}
          facultyList={facultyList}
          departments={departments}
          staffList={staffList}
        />
      </div>
    </div>
  );
};

export default ApplyLeave;
