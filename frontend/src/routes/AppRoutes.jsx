import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../pages/public/LandingPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ForceChangePasswordPage from '../pages/auth/ForceChangePasswordPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import StudentCompanies from '../pages/student/StudentCompanies';
import StudentApplications from '../pages/student/StudentApplications';
import StudentResume from '../pages/student/StudentResume';
import StudentReadiness from '../pages/student/StudentReadiness';
import StudentOffers from '../pages/student/StudentOffers';
import NotificationsPage from '../pages/shared/NotificationsPage';
import SettingsPage from '../pages/shared/SettingsPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminStudents from '../pages/admin/AdminStudents';
import AdminCompanies from '../pages/admin/AdminCompanies';
import AdminDrives from '../pages/admin/AdminDrives';
import AdminApplications from '../pages/admin/AdminApplications';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminReports from '../pages/admin/AdminReports';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminOffers from '../pages/admin/AdminOffers';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route path="/student" element={<DashboardLayout title="Student Portal" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="change-password" element={<ForceChangePasswordPage />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="companies" element={<StudentCompanies />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="resume" element={<StudentResume />} />
          <Route path="readiness" element={<StudentReadiness />} />
          <Route path="offers" element={<StudentOffers />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<DashboardLayout title="Admin Portal" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="drives" element={<AdminDrives />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="broadcast" element={<AdminNotifications />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
