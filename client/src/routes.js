import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import Holidays from "./pages/Holidays";
import Profile from "./pages/Profile";
import SubstituteRequests from "./pages/SubstituteRequests";

import HODApproval from "./pages/HODApproval";
import HODLeaveBalance from "./pages/HODLeaveBalance";
import PrincipalApprovals from "./pages/PrincipalApprovals";

import ProtectedRoute from "./utils/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Apply Leave */}
      <Route
        path="/apply"
        element={
          <ProtectedRoute>
            <ApplyLeave />
          </ProtectedRoute>
        }
      />

      {/* Leave History */}
      <Route
        path="/leave-history"
        element={
          <ProtectedRoute>
            <LeaveHistory />
          </ProtectedRoute>
        }
      />

      {/* Substitute Requests */}
      <Route
        path="/substitute-requests"
        element={
          <ProtectedRoute allowed={["faculty", "hod"]}>
            <SubstituteRequests />
          </ProtectedRoute>
        }
      />

      {/* Holidays */}
      <Route
        path="/holidays"
        element={
          <ProtectedRoute>
            <Holidays />
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowed={["hod"]}>
            <HODApproval />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hod/leave-balance"
        element={
          <ProtectedRoute allowed={["hod"]}>
            <HODLeaveBalance />
          </ProtectedRoute>
        }
      />

      {/* Principal */}
      <Route
        path="/principal-approvals"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <PrincipalApprovals />
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default AppRoutes;
