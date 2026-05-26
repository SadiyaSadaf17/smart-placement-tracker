import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/ui/Spinner';
import PermissionGuard from '../components/auth/PermissionGuard';
import { PERMISSIONS } from '../utils/rbac';

const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const ForceChangePasswordPage = lazy(() => import('../pages/auth/ForceChangePasswordPage'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentProfile = lazy(() => import('../pages/student/StudentProfile'));
const StudentCompanies = lazy(() => import('../pages/student/StudentCompanies'));
const StudentApplications = lazy(() => import('../pages/student/StudentApplications'));
const StudentResume = lazy(() => import('../pages/student/StudentResume'));
const StudentReadiness = lazy(() => import('../pages/student/StudentReadiness'));
const StudentOffers = lazy(() => import('../pages/student/StudentOffers'));
const NotificationsPage = lazy(() => import('../pages/shared/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/shared/SettingsPage'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminStudents = lazy(() => import('../pages/admin/AdminStudents'));
const AdminCompanies = lazy(() => import('../pages/admin/AdminCompanies'));
const AdminDrives = lazy(() => import('../pages/admin/AdminDrives'));
const AdminApplications = lazy(() => import('../pages/admin/AdminApplications'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminOffers = lazy(() => import('../pages/admin/AdminOffers'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminEligibility = lazy(() => import('../pages/admin/AdminEligibility'));
const AdminScheduler = lazy(() => import('../pages/admin/AdminScheduler'));
const AdminStudentDetail = lazy(() => import('../pages/admin/AdminStudentDetail'));
const AdminPolicies = lazy(() => import('../pages/admin/AdminPolicies'));
const AdminEnterpriseTools = lazy(() => import('../pages/admin/AdminEnterpriseTools'));
const StudentApplicationHistory = lazy(() => import('../pages/student/StudentApplicationHistory'));
const StudentSchedule = lazy(() => import('../pages/student/StudentSchedule'));
const StudentDevelopment = lazy(() => import('../pages/student/StudentDevelopment'));

const page = (element, permission) => (
  permission ? <PermissionGuard permission={permission}>{element}</PermissionGuard> : element
);

const PageLoader = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Spinner className="h-10 w-10" />
  </main>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="history" element={<StudentApplicationHistory />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="development" element={<StudentDevelopment />} />
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
          <Route path="dashboard" element={page(<AdminDashboard />, PERMISSIONS.VIEW_DASHBOARD)} />
          <Route path="change-password" element={<ForceChangePasswordPage />} />
          <Route path="students" element={page(<AdminStudents />, PERMISSIONS.VIEW_STUDENTS)} />
          <Route path="students/:id" element={page(<AdminStudentDetail />, PERMISSIONS.VIEW_STUDENTS)} />
          <Route path="applications" element={page(<AdminApplications />, PERMISSIONS.VIEW_APPLICATIONS)} />
          <Route path="eligibility" element={page(<AdminEligibility />, PERMISSIONS.VIEW_STUDENTS)} />
          <Route path="scheduler" element={page(<AdminScheduler />, PERMISSIONS.VIEW_APPLICATIONS)} />
          <Route path="offers" element={page(<AdminOffers />, PERMISSIONS.VIEW_OFFERS)} />
          <Route path="companies" element={page(<AdminCompanies />, PERMISSIONS.VIEW_DRIVES)} />
          <Route path="drives" element={page(<AdminDrives />, PERMISSIONS.VIEW_DRIVES)} />
          <Route path="analytics" element={page(<AdminAnalytics />, PERMISSIONS.VIEW_ANALYTICS)} />
          <Route path="reports" element={page(<AdminReports />, PERMISSIONS.VIEW_REPORTS)} />
          <Route path="audit" element={page(<AdminAuditLogs />, PERMISSIONS.VIEW_AUDIT_LOGS)} />
          <Route path="policies" element={page(<AdminPolicies />, PERMISSIONS.MANAGE_DRIVES)} />
          <Route path="enterprise" element={page(<AdminEnterpriseTools />, PERMISSIONS.VIEW_REPORTS)} />
          <Route path="notifications" element={page(<NotificationsPage />, PERMISSIONS.VIEW_DASHBOARD)} />
          <Route path="broadcast" element={page(<AdminNotifications />, PERMISSIONS.SEND_NOTIFICATIONS)} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
