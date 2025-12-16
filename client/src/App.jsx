import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";


// important: Login and Dashboard are NOT lazy
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// lazy-loaded pages
const Layout = lazy(() => import("./components/Layout"));
const AdminAddUser = lazy(() => import("./pages/AdminAddUser"));
const AdminResetRequest = lazy(() => import("./pages/AdminResetRequests"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const ApplyLeave = lazy(() => import("./pages/ApplyLeave"));
const LeaveHistory = lazy(() => import("./pages/LeaveHistory"));
const SubstituteRequests = lazy(() => import("./pages/SubstituteRequests"));
const Holidays = lazy(() => import("./pages/Holidays"));
const Profile = lazy(() => import("./pages/Profile"));
const HODApproval = lazy(() => import("./pages/HODApproval"));
const HODLeaveBalance = lazy(() => import("./pages/HODLeaveBalance"));
const PrincipalApprovals = lazy(() => import("./pages/PrincipalApprovals"));
const DeleteAdminUser = lazy(() => import("./pages/DeleteAdminUser"));

// ProtectedRoute is NOT lazy anymore
import ProtectedRoute from "./utils/ProtectedRoute";
import { FullPageSpinner, DashboardSkeleton } from "./components/Fallbacks";

import { SnackbarProvider } from './context/SnackbarContext';

const App = () => {
  return (
    <SnackbarProvider>
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ChangePassword mode="forgot" />} />

        {/* WRAP LAYOUT */}
        <Route path="/" element={<Layout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                {/* show lightweight skeleton while Dashboard (and any nested lazy chunks) load */}
                <Suspense fallback={<DashboardSkeleton />}>
                  <Dashboard />
                </Suspense>
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
              <ProtectedRoute allowed={["faculty", "hod","admin","staff"]}>
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
              <ProtectedRoute allowed={["principal"]}>
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
    </SnackbarProvider>
  );
  
};

export default App;
