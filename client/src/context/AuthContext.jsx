import React, { createContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stable login function
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Stable logout function
  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }

    setUser(null);
    window.location.href = "/login";
  }, []);

  // Rehydrate existing session (runs once)
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/auth/me");
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
