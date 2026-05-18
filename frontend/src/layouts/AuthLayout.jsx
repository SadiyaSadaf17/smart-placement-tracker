import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Link to="/" className="mb-8 flex items-center gap-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold">PT</span>
          <span className="text-xl font-semibold">Smart Placement Tracker</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-slate-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
