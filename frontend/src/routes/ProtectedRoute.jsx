import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../components/ui/Spinner';

export default function ProtectedRoute({ role }) {
  const { token, user, loading, bootstrapped } = useSelector((s) => s.auth);

  if (!token) return <Navigate to="/login" replace />;

  if (!bootstrapped || (token && loading && !user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner className="h-10 w-10" />
      </main>
    );
  }

  if (role && user?.role !== role) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return <Outlet />;
}
