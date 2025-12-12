import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";

const AdminAddUser = () => {
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    password: "",
    role: "faculty",
    department_code: "",
    phone: "",
    desc: "",
    date_of_joining: ""
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // Load department list from departments table
  const loadDepartments = async () => {
    try {
      const res = await axios.get("/departments");
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error("Failed loading departments", err);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  // Form handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const payload = {
      ...form,
      designation: form.desc,
      date_joined: form.date_of_joining,
    };

    try {
      const res = await axios.post("/add-user", payload);

      setMessage({
        type: res.data.type || "success",
        text: res.data.message
      });

      setForm({
        user_id: "",
        name: "",
        email: "",
        password: "",
        role: "faculty",
        department_code: "",
        phone: "",
        desc: "",
        date_of_joining: "",
      });

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };


  return (
    <div className="apply-leave-container">
      <div className="apply-leave-card" style={{ maxWidth: "600px" }}>
        <h2>Add New User</h2>

        {message.text && (
          <div className={message.type === "success" ? "pass" : "error"}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>User ID</label>
          <input
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            required
          />

          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
            <option value="principal">Principal</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>

          {(form.role !== "admin" && form.role !== "principal") && (
            <>
              <label>Department</label>
              <select
                name="department_code"
                value={form.department_code}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Designation</label>
          <input
            name="desc"
            value={form.desc}
            onChange={handleChange}
          />

          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <label>Date Of Joining</label>
          <input
            type="date"
            name="date_of_joining"
            value={form.date_of_joining}
            onChange={handleChange}
          />

          <button type="submit">Add User</button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;
