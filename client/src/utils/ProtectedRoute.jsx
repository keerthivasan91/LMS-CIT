import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children, allowed }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait for session check
  if (loading) return null; // or loader component

  // If no user session found → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role check
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
