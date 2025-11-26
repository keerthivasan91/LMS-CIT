import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children, allowed }) => {
  const { user, loading } = useContext(AuthContext);

  // Wait until auth state is known
  if (loading) {
    return <div className="route-loader">Loading...</div>;
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default React.memo(ProtectedRoute);
