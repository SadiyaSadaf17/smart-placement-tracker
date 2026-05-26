import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';
import { hasPermission, isStaffRole } from '../utils/rbac';

export default function ProtectedRoute({ role, permission }) {
  const { token, user, loading, bootstrapped } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (!bootstrapped || (token && loading && !user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner className="h-10 w-10" />
      </main>
    );
  }

  const roleAllowed = !role
    || user?.role === role
    || (role === 'admin' && isStaffRole(user?.role));

  if (!roleAllowed) {
    return (
      <Navigate
        to={isStaffRole(user?.role) ? '/admin/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  if (permission && !hasPermission(user?.role, permission)) {
    return <Navigate to="/404" replace />;
  }

  const changePasswordPath = isStaffRole(user?.role) ? '/admin/change-password' : '/student/change-password';
  if (user?.mustChangePassword && location.pathname !== changePasswordPath) {
    return <Navigate to={changePasswordPath} replace />;
  }

  return <Outlet />;
}
