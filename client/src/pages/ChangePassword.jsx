import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";

const PasswordPage = ({ mode = "change" }) => {
  const navigate = useNavigate();
  const { uid } = useParams();

  // Shared fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Forgot password fields
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState("");

  // Change-password fields
  const [currentPassword, setCurrentPassword] = useState("");

  // Messages
  const [message, setMessage] = useState(null);
  const [type, setType] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ----------------------------------------------------------
       1. ADMIN RESET MODE
    ---------------------------------------------------------- */
    if (mode === "admin-reset") {
      if (newPassword !== confirmPassword) {
        setType("error");
        setMessage("Passwords do not match.");
        return;
      }

      try {
        const res = await axios.post("/admin/reset-password-final", {
          user_id: uid,
          new_password: newPassword,
        });

        setType("success");
        setMessage(res.data.message);
        setTimeout(() => navigate("/admin/reset-requests"), 1500);
      } catch (err) {
        setType("error");
        setMessage(err.response?.data?.message || "Reset failed");
      }
      return;
    }

    /* ----------------------------------------------------------
       2. FORGOT PASSWORD REQUEST
    ---------------------------------------------------------- */
    if (mode === "forgot") {
      try {
        const res = await axios.post("/forgot-password-request", {
          user_id: userID,
          email: email,
        });

        setType("success");
        setMessage(res.data.message);
        setTimeout(() => navigate("/login"), 1500);
      } catch (err) {
        setType("error");
        setMessage(err.response?.data?.message || "Request failed");
      }
      return;
    }

    /* ----------------------------------------------------------
       3. NORMAL USER CHANGE PASSWORD
    ---------------------------------------------------------- */
    if (newPassword !== confirmPassword) {
      setType("error");
      setMessage("New password & confirm password do not match.");
      return;
    }

    try {
      const res = await axios.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setType("success");
      setMessage(res.data.message);
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setType("error");
      setMessage(err.response?.data?.message || "Error changing password");
    }
  };

  return (
    <div className="card" style={{ marginLeft: "30px", marginTop: "100px" }}>
      <div className="card-header">
        <h4>
          {mode === "forgot"
            ? "Reset Password Request"
            : mode === "admin-reset"
            ? `Admin Reset for ${uid}`
            : "Change Password"}
        </h4>
      </div>

      <div className="card-body">
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

          {/* ----------------------------------------------------------
              ADMIN RESET UI
          ---------------------------------------------------------- */}
          {mode === "admin-reset" && (
            <>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <br />

              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <br />
            </>
          )}

          {/* ----------------------------------------------------------
              FORGOT PASSWORD UI
          ---------------------------------------------------------- */}
          {mode === "forgot" && (
            <>
              <label className="form-label">User ID</label>
              <input
                className="form-control"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                required
              />
              <br />

              <label className="form-label">Registered Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <br />
            </>
          )}

          {/* ----------------------------------------------------------
              NORMAL CHANGE PASSWORD UI
          ---------------------------------------------------------- */}
          {mode === "change" && (
            <>
                <br></br>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <br />

              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <br />

              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <br />
              <br />
            </>
          )}

          {/* SUBMIT + CANCEL */}
          <button type="submit" className="change-btn">
            {mode === "admin-reset"
              ? "Reset Password"
              : mode === "forgot"
              ? "Submit Request"
              : "Change Password"}
          </button>

          <button
            type="button"
            className="logout-btn"
            style={{ marginLeft: "10px" }}
            onClick={() =>
              navigate(
                mode === "admin-reset"
                  ? "/admin/reset-requests"
                  : mode === "forgot"
                  ? "/login"
                  : "/profile"
              )
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
