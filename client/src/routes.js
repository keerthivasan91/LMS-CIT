import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const ApplyLeave = lazy(() => import("./pages/ApplyLeave"));
const LeaveHistory = lazy(() => import("./pages/LeaveHistory"));
const Holidays = lazy(() => import("./pages/Holidays"));
const Profile = lazy(() => import("./pages/Profile"));
const SubstituteRequests = lazy(() => import("./pages/SubstituteRequests"));

const HODApproval = lazy(() => import("./pages/HODApproval"));
const HODLeaveBalance = lazy(() => import("./pages/HODLeaveBalance"));
const PrincipalApprovals = lazy(() => import("./pages/PrincipalApprovals"));

const ProtectedRoute = lazy(() => import("./utils/ProtectedRoute"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>

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

        {/* HOD */}
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

        {/* Principal Approvals */}
        <Route
          path="/principal-approvals"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <PrincipalApprovals />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>

    </Suspense>
  );
};

export default AppRoutes;
