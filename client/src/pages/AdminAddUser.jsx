import React, { useState } from "react";
import axios from "../api/axiosConfig";

const AdminAddUser = () => {
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    password: "",
    role: "faculty",
    department: "",
    phone: "",
    designation: "",
    date_joined: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post("/admin/add-user", form);

      setMessage({ type: "success", text: res.data.message });

      setForm({
        user_id: "",
        name: "",
        email: "",
        password: "",
        role: "faculty",
        department: "",
        phone: "",
        designation: "",
        date_joined: "",
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
          <div
            className={message.type === "success" ? "pass" : "error"}
            style={{ width: "100%" }}
          >
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

          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
          />

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />

          <label>Designation</label>
          <input
            name="designation"
            value={form.designation}
            onChange={handleChange}
          />

          <label>Date Joined</label>
          <input
            type="date"
            name="date_joined"
            value={form.date_joined}
            onChange={handleChange}
          />

          <button type="submit">Add User</button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUser;
