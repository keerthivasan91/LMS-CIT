import React, { createContext, useEffect, useState } from "react";
import axios from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // user object
  const [token, setToken] = useState(null);   // JWT token
  const [loading, setLoading] = useState(true);

  // Login function (stores user + token)
  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);

    // Store token in localStorage
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    // Attach token to all axios requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
  };

  // Logout (clear everything)
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    window.location.href = "/login";
  };

  // Rehydrate user on page load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Set axios token
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
