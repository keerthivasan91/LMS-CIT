import React, { createContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stable login function
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Stable logout function
  const logout = useCallback(async () => {
    setUser(null);

    navigate("/login", { replace: true });
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [navigate]);

  // Rehydrate existing session (runs once)
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,        // ok without callback (internal setter)
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
