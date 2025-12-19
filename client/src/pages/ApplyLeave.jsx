import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";
import LeaveForm from "../components/LeaveForm";
import "../App.css";

const ApplyLeave = () => {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();

  const isStaffLike = user?.role === "staff" || user?.role === "admin";
  const isFacultyLike = user?.role === "faculty" || user?.role === "hod";

  /* ------------------------------------------------------------
     FORM STATE
  ------------------------------------------------------------ */
  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "",
    start_session: "Forenoon",
    end_date: "",
    end_session: "Afternoon",
    reason: "",

    arr1_dept: "",
    arr1_faculty: "",
    arr1_staff: "",
    arr1_details: "",

    arr2_dept: "",
    arr2_faculty: "",
    arr2_staff: "",
    arr2_details: "",

    arr3_dept: "",
    arr3_faculty: "",
    arr3_staff: "",
    arr3_details: "",

    arr4_dept: "",
    arr4_faculty: "",
    arr4_staff: "",
    arr4_details: ""
  });

  /* ------------------------------------------------------------
     OPTIONS
  ------------------------------------------------------------ */
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [facultyArr1, setFacultyArr1] = useState([]);
  const [facultyArr2, setFacultyArr2] = useState([]);
  const [facultyArr3, setFacultyArr3] = useState([]);
  const [facultyArr4, setFacultyArr4] = useState([]);

  /* ------------------------------------------------------------
     HANDLE CHANGE
  ------------------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));

    if (name === "arr1_dept") loadFacultyForDept(value, 1);
    if (name === "arr2_dept") loadFacultyForDept(value, 2);
    if (name === "arr3_dept") loadFacultyForDept(value, 3);
    if (name === "arr4_dept") loadFacultyForDept(value, 4);
  };

  /* ------------------------------------------------------------
     LOAD FACULTY BY DEPARTMENT
  ------------------------------------------------------------ */
  const loadFacultyForDept = async (dept, row) => {
    if (!dept) {
      if (row === 1) setFacultyArr1([]);
      if (row === 2) setFacultyArr2([]);
      if (row === 3) setFacultyArr3([]);
      if (row === 4) setFacultyArr4([]);
      return;
    }

    try {
      const res = await axios.get(`/faculty/${dept.toLowerCase()}`);
      const list = res.data.faculty || [];

      if (row === 1) setFacultyArr1(list);
      if (row === 2) setFacultyArr2(list);
      if (row === 3) setFacultyArr3(list);
      if (row === 4) setFacultyArr4(list);
    } catch (err) {
      console.error("Faculty load failed", err);
    }
  };

  /* ------------------------------------------------------------
     LOAD STAFF (STAFF + ADMIN)
  ------------------------------------------------------------ */
  const loadStaff = async () => {
    if (!isStaffLike) return;

    try {
      const dept = user.department_code.toLowerCase();
      const res = await axios.get(`/staff/${dept}`);
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error("Staff load failed", err);
    }
  };

  /* ------------------------------------------------------------
     LOAD DEPARTMENTS (FACULTY / HOD)
  ------------------------------------------------------------ */
  const loadDepartments = async () => {
    if (!isFacultyLike) return;

    try {
      const res = await axios.get(`/branches`);
      setDepartments(res.data.branches || []);
    } catch (err) {
      console.error("Department load failed", err);
    }
  };

  /* ------------------------------------------------------------
     SUBMIT
  ------------------------------------------------------------ */
  const submitForm = async (e) => {
    e.preventDefault();

    // Mandatory substitute check (except principal if you allow)
    if (isStaffLike && !form.arr1_staff) {
      showSnackbar("Please select a substitute", "error");
      return;
    }

    const payload = {
      leave_type: form.leave_type,
      start_date: form.start_date,
      start_session: form.start_session,
      end_date: form.end_date,
      end_session: form.end_session,
      reason: form.reason,

      arr1_dept: form.arr1_dept,
      arr1_faculty: isFacultyLike ? form.arr1_faculty : "",
      arr1_staff: isStaffLike ? form.arr1_staff : "",
      arr1_details: form.arr1_details,

      arr2_dept: form.arr2_dept,
      arr2_faculty: isFacultyLike ? form.arr2_faculty : "",
      arr2_staff: isStaffLike ? form.arr2_staff : "",
      arr2_details: form.arr2_details,

      arr3_dept: form.arr3_dept,
      arr3_faculty: isFacultyLike ? form.arr3_faculty : "",
      arr3_staff: isStaffLike ? form.arr3_staff : "",
      arr3_details: form.arr3_details,

      arr4_dept: form.arr4_dept,
      arr4_faculty: isFacultyLike ? form.arr4_faculty : "",
      arr4_staff: isStaffLike ? form.arr4_staff : "",
      arr4_details: form.arr4_details
    };

    console.log("APPLY PAYLOAD:", payload);

    try {
      await axios.post("/apply", payload);
      showSnackbar("Leave applied successfully", "success");

      // reset
      setForm({
        leave_type: "Casual Leave",
        start_date: "",
        start_session: "Forenoon",
        end_date: "",
        end_session: "Afternoon",
        reason: "",
        arr1_dept: "", arr1_faculty: "", arr1_staff: "", arr1_details: "",
        arr2_dept: "", arr2_faculty: "", arr2_staff: "", arr2_details: "",
        arr3_dept: "", arr3_faculty: "", arr3_staff: "", arr3_details: "",
        arr4_dept: "", arr4_faculty: "", arr4_staff: "", arr4_details: ""
      });

      setFacultyArr1([]); setFacultyArr2([]);
      setFacultyArr3([]); setFacultyArr4([]);

    } catch (err) {
      showSnackbar(err.response?.data?.message || "Apply failed", "error");
    }
  };

  /* ------------------------------------------------------------
     INIT
  ------------------------------------------------------------ */
  useEffect(() => {
    loadStaff();
    loadDepartments();
  }, []);

  return (
    <div className="apply-leave-container">
      <div className="apply-leave-card">
        <h2>Apply for Leave</h2>

        <LeaveForm
          form={form}
          onChange={handleChange}
          onSubmit={submitForm}
          role={user?.role}
          departments={departments}
          staffList={staffList}
          facultyArr1={facultyArr1}
          facultyArr2={facultyArr2}
          facultyArr3={facultyArr3}
          facultyArr4={facultyArr4}
        />
      </div>
    </div>
  );
};

export default ApplyLeave;
