import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import { useSnackbar } from "./context/SnackbarContext";
import LeaveForm from "../components/LeaveForm";
import "../App.css";

const ApplyLeave = () => {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();

  /* ------------------------------------------------------------
     FORM STATE WITH 4 ARRANGEMENT ROWS
  ------------------------------------------------------------ */
  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "",
    start_session: "Forenoon",
    end_date: "",
    end_session: "Afternoon",
    reason: "",

    // row 1
    arr1_dept: "",
    arr1_faculty: "",
    arr1_staff: "",
    arr1_details: "",

    // row 2
    arr2_dept: "",
    arr2_faculty: "",
    arr2_staff: "",
    arr2_details: "",

    // row 3
    arr3_dept: "",
    arr3_faculty: "",
    arr3_staff: "",
    arr3_details: "",

    // row 4
    arr4_dept: "",
    arr4_faculty: "",
    arr4_staff: "",
    arr4_details: ""
  });

  /* ------------------------------------------------------------
     STATE FOR OPTIONS
  ------------------------------------------------------------ */
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // Faculty per arrangement row
  const [facultyArr1, setFacultyArr1] = useState([]);
  const [facultyArr2, setFacultyArr2] = useState([]);
  const [facultyArr3, setFacultyArr3] = useState([]);
  const [facultyArr4, setFacultyArr4] = useState([]);

  /* ------------------------------------------------------------
     HANDLE INPUT + LOAD FACULTY PER ROW
  ------------------------------------------------------------ */
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // When department selected load respective faculty
    if (name === "arr1_dept") loadFacultyForDept(value, 1);
    if (name === "arr2_dept") loadFacultyForDept(value, 2);
    if (name === "arr3_dept") loadFacultyForDept(value, 3);
    if (name === "arr4_dept") loadFacultyForDept(value, 4);
  };

  /* ------------------------------------------------------------
     LOAD FACULTY FOR SPECIFIC DEPARTMENT & ROW
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
      console.error("Failed to load faculty for dept:", dept, err);
    }
  };

  /* ------------------------------------------------------------
     LOAD STAFF FOR STAFF USERS ONLY
  ------------------------------------------------------------ */
  const loadStaffForStaffUser = async () => {
    if (user?.role !== "staff") return;

    try {
      const branch = user.department_code.toLowerCase();
      const res = await axios.get(`/staff/${branch}`);
      setStaffList(res.data.staff || []);
    } catch (err) {
      console.error("Failed to load staff substitutes", err);
    }
  };

  /* ------------------------------------------------------------
     FACULTY/HOD → LOAD ALL DEPARTMENTS
  ------------------------------------------------------------ */
  const loadDepartments = async () => {
    if (user?.role === "faculty" || user?.role === "hod") {
      try {
        const res = await axios.get(`/branches`);
        setDepartments(res.data.branches || []);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    }
  };

  /* ------------------------------------------------------------
     SUBMIT LEAVE REQUEST
  ------------------------------------------------------------ */
  const submitForm = async (e) => {
    e.preventDefault();

    // Build the exact payload that backend expects
    const payload = {
      leave_type: form.leave_type,
      start_date: form.start_date,
      start_session: form.start_session,
      end_date: form.end_date,
      end_session: form.end_session,
      reason: form.reason,
      
      // Individual arrangement fields (what backend expects)
      arr1_dept: form.arr1_dept,
      arr1_faculty: user?.role === "staff" ? "" : form.arr1_faculty,
      arr1_staff: user?.role === "staff" ? form.arr1_staff : "",
      arr1_details: form.arr1_details,

      arr2_dept: form.arr2_dept,
      arr2_faculty: user?.role === "staff" ? "" : form.arr2_faculty,
      arr2_staff: user?.role === "staff" ? form.arr2_staff : "",
      arr2_details: form.arr2_details,

      arr3_dept: form.arr3_dept,
      arr3_faculty: user?.role === "staff" ? "" : form.arr3_faculty,
      arr3_staff: user?.role === "staff" ? form.arr3_staff : "",
      arr3_details: form.arr3_details,

      arr4_dept: form.arr4_dept,
      arr4_faculty: user?.role === "staff" ? "" : form.arr4_faculty,
      arr4_staff: user?.role === "staff" ? form.arr4_staff : "",
      arr4_details: form.arr4_details
    };

    console.log("Sending payload to /apply:", payload);

    try {
      const response = await axios.post("/apply", payload);
      showSnackbar("Leave applied successfully!", "success");

      // Reset form
      setForm({
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

      setFacultyArr1([]);
      setFacultyArr2([]);
      setFacultyArr3([]);
      setFacultyArr4([]);

    } catch (err) {
      console.error("ERROR submitting leave:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        showSnackbar(err.response.data.message || "Error submitting leave", "error");
      } else {
        showSnackbar("Error submitting leave", "error");
      }
    }
  };

  /* ------------------------------------------------------------
     INITIAL LOAD
  ------------------------------------------------------------ */
  useEffect(() => {
    loadStaffForStaffUser();
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