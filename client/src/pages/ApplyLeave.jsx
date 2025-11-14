import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import LeaveForm from "../components/LeaveForm";
import "../App.css";

const ApplyLeave = () => {
  const { user, token } = useContext(AuthContext);

  const [form, setForm] = useState({
    leave_type: "Casual",
    start_date: "",
    start_session: "Forenoon",
    end_date: "",
    end_session: "Afternoon",
    reason: "",
    arrangement_details: "",
    substitute_user_id: "",
    department_select: "",
  });

  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // STAFF → load all faculty substitutes
  const loadFaculty = async () => {
    try {
      if (user?.role === "staff") {
        const res = await axios.get("/api/staff/" + user.department, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFacultyList(res.data.staff || []);
      }
    } catch (err) {
      console.error("Failed load faculty", err);
    }
  };

  // FACULTY / HOD → load departments
  const loadDepartments = async () => {
    try {
      if (user?.role !== "staff") {
        const res = await axios.get("/api/branches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data.branches || []);
      }
    } catch (err) {
      console.error("Failed load departments", err);
    }
  };

  // load staff list when a department is chosen
  const loadStaff = async () => {
    try {
      if (form.department_select) {
        const res = await axios.get(
          `/api/staff/${form.department_select}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStaffList(res.data.staff || []);
      } else {
        setStaffList([]);
      }
    } catch (err) {
      console.error("Failed load staff", err);
    }
  };

  // Submit leave
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
      substitute_user_id: form.substitute_user_id || null,
    };

    try {
      await axios.post("/api/apply", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Leave applied successfully");

      // Reset form
      setForm({
        leave_type: "Casual",
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
      console.error(err);
      alert("Error submitting leave");
    }
  };

  useEffect(() => {
    loadFaculty();
    loadDepartments();
  }, []);

  useEffect(() => {
    loadStaff();
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
