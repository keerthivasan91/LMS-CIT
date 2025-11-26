import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy-loaded pages
const Layout = lazy(() => import("./components/Layout"));
const AdminAddUser = lazy(() => import("./pages/AdminAddUser"));
const AdminResetRequest = lazy(() => import("./pages/AdminResetRequests"));
const Login = lazy(() => import("./pages/Login"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ApplyLeave = lazy(() => import("./pages/ApplyLeave"));
const LeaveHistory = lazy(() => import("./pages/LeaveHistory"));
const SubstituteRequests = lazy(() => import("./pages/SubstituteRequests"));
const Holidays = lazy(() => import("./pages/Holidays"));
const Profile = lazy(() => import("./pages/Profile"));
const HODApproval = lazy(() => import("./pages/HODApproval"));
const HODLeaveBalance = lazy(() => import("./pages/HODLeaveBalance"));
const PrincipalApprovals = lazy(() => import("./pages/PrincipalApprovals"));
const DeleteAdminUser = lazy(() => import("./pages/DeleteAdminUser"));
const ProtectedRoute = lazy(() => import("./utils/ProtectedRoute"));

const App = () => {
  return (
    <Suspense fallback={<div className="loader">Loading...</div>}>

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/forgot-password" 
          element={<ChangePassword mode="forgot" />} 
        />

        {/* WRAP LAYOUT */}
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

          {/* HOD */}
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
    </Suspense>
  );
};

export default App;
