import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  const { user } = useSelector((s) => s.auth);
  const home = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/student/dashboard' : '/';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-8xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">The page you are looking for does not exist or has been moved.</p>
      <Link to={home} className="mt-8">
        <Button>Go to {user ? 'Dashboard' : 'Home'}</Button>
      </Link>
    </main>
  );
}
