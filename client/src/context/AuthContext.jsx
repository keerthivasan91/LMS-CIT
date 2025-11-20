import React, { createContext, useEffect, useState } from "react";
import axios from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session-based login: backend sets cookie
  const login = (userData) => {
    setUser(userData);
  };

  // Logout — tell backend to destroy session
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }

    setUser(null);

    window.location.href = "/login";
  };

  // Rehydrate user from session on page load
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
