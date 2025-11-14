import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const PasswordPage = ({ mode = "change" }) => {
  const navigate = useNavigate();

  // Common fields
  const [email, setEmail] = useState("");

  // Change-password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState(null);
  const [type, setType] = useState(null); // success / error

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ---------------------- FORGOT PASSWORD ---------------------- */
    if (mode === "forgot") {
      try {
        const response = await axios.post("/forgot-password", {
          email,
          new_password: newPassword,
        });

        setType("success");
        setMessage(response.data.message);

        setTimeout(() => navigate("/login"), 1200);
      } catch (error) {
        setType("error");
        setMessage(error.response?.data?.message || "Error resetting password");
      }

      return;
    }

    /* ---------------------- CHANGE PASSWORD ---------------------- */
    if (newPassword !== confirmPassword) {
      setType("error");
      setMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await axios.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setType("success");
      setMessage(response.data.message);

      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) {
      setType("error");
      setMessage(error.response?.data?.message || "Error changing password");
    }
  };

  return (
    <div className="card" style={{ marginLeft: "30px", marginTop: "100px" }}>
      <div className="card-header">
        <h4>{mode === "forgot" ? "Reset Password" : "Change Password"}</h4>
      </div>

      <div className="card-body">

        {/* Message Box */}
        {message && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              color: "#fff",
              backgroundColor: type === "success" ? "green" : "red",
              borderRadius: "5px",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ------------------ FORGOT PASSWORD FIELDS ------------------ */}
          {mode === "forgot" && (
            <>
              <div>
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <br />

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <br />
            </>
          )}

          {/* ------------------ CHANGE PASSWORD FIELDS ------------------ */}
          {mode === "change" && (
            <>
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <br />

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <br />

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <br />
            </>
          )}

          <button type="submit" className="change-btn">
            {mode === "forgot" ? "Reset Password" : "Change Password"}
          </button>

          <button
            type="button"
            className="logout-btn"
            style={{ marginLeft: "10px" }}
            onClick={() =>
              navigate(mode === "forgot" ? "/login" : "/profile")
            }
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPage;
