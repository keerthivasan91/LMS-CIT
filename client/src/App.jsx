import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/layout";
import AdminAddUser from "./pages/AdminAddUser";
import AdminResetRequest from "./pages/AdminResetRequests";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import SubstituteRequests from "./pages/SubstituteRequests";
import Holidays from "./pages/Holidays";
import Profile from "./pages/Profile";
import HODApproval from "./pages/HODApproval";
import HODLeaveBalance from "./pages/HODLeaveBalance";
import PrincipalApprovals from "./pages/PrincipalApprovals";
import ProtectedRoute from "./utils/ProtectedRoute";
import DeleteAdminUser from "./pages/DeleteAdminUser";

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ChangePassword mode="forgot" />} />

      {/* LAYOUT ROUTES */}
      <Route path="/" element={<Layout />}>

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="change-password"
          element={
            <ProtectedRoute>
              <ChangePassword mode="change" />
            </ProtectedRoute>
          }
        />

        <Route
          path="apply"
          element={
            <ProtectedRoute>
              <ApplyLeave />
            </ProtectedRoute>
          }
        />

        <Route
          path="leave-history"
          element={
            <ProtectedRoute>
              <LeaveHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="holidays"
          element={
            <ProtectedRoute>
              <Holidays />
            </ProtectedRoute>
          }
        />

        <Route
          path="substitute-requests"
          element={
            <ProtectedRoute allowed={["faculty", "hod"]}>
              <SubstituteRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* HOD ONLY */}
        <Route
          path="hod"
          element={
            <ProtectedRoute allowed={["hod"]}>
              <HODApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="hod/leave-balance"
          element={
            <ProtectedRoute allowed={["hod"]}>
              <HODLeaveBalance />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="principal-approvals"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <PrincipalApprovals />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/add-user"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminAddUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/delete-user"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <DeleteAdminUser />
            </ProtectedRoute>
          }
        />


        <Route
          path="admin/reset-requests"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminResetRequest />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/reset-password/:uid"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <ChangePassword mode="admin-reset" />
            </ProtectedRoute>
          }
        />




        {/* DEFAULT */}
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
