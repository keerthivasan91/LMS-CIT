import React, { useState, useContext } from "react";
import axios from "../api/axiosConfig";
import AuthContext from "../context/AuthContext";
import "../App.css";

const Login = () => {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    user_id: "",
    password: ""
  });

  const [error, setError] = useState("");

  // Update local form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/auth/login", form);

      if (!res.data?.token || !res.data?.user) {
        setError("Invalid response from server");
        return;
      }

      // Call AuthContext login(user, token)
      login(res.data.user, res.data.token);

      // Redirect to dashboard
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      setError("Invalid user ID or password");
    }
  };

  return (
    <div className="container">
      <div className="left-section"></div>

      <div className="right-section">
        <div className="logo-container">
          <img src="/logo.png" alt="CIT Logo" className="logo-img" />
        </div>

        <h2 className="portal-title">LMS Portal</h2>

        <div className="login-card">
          <div className="login-header">
            <h1>Login</h1>
            {error && <span className="error">{error}</span>}
          </div>

          <form onSubmit={handleSubmit}>
            <table>
              <tbody>
                <tr>
                  <td><label>User ID</label></td>
                  <td>
                    <input
                      type="text"
                      name="user_id"
                      placeholder="Enter your User ID"
                      value={form.user_id}
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>

                <tr>
                  <td><label>Password</label></td>
                  <td>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <button type="submit" className="login-btn">Login</button>

            <a
              href="/forgot-password"
              style={{ color: "red", display: "block", marginTop: "10px" }}
            >
              Forgot Password?
            </a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
