import { Menu, Moon, Sun, LogOut, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import api from '../../services/api';

export default function Header({ onMenuClick, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode } = useSelector((s) => s.theme);
  const { user, profile } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    dispatch(logout());
    navigate('/login');
  };

  const notifPath = user?.role === 'admin' ? '/admin/notifications' : '/student/notifications';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 lg:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenuClick} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(notifPath)} className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button type="button" onClick={() => dispatch(toggleTheme())} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block">
          {profile?.fullName || user?.email}
        </span>
        <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
