import { Menu, Moon, Sun, LogOut, Bell, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import api from '../../services/api';

export default function Header({ onMenuClick, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
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
    <header className="sticky top-0 z-30 border-b border-slate-200/40 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          <button 
            type="button" 
            onClick={onMenuClick} 
            className="rounded-lg p-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors lg:hidden"
          >
            <Menu size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search - hidden on mobile */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden sm:inline-flex rounded-lg p-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 transition-colors"
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate(notifPath)}
            className="relative rounded-lg p-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="rounded-lg p-2 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 transition-colors"
          >
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User info - hidden on mobile */}
          <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block px-3 py-2 truncate max-w-[150px]">
            {profile?.fullName || user?.email}
          </span>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Search bar - expanded on click */}
      {searchOpen && (
        <div className="border-t border-slate-200/40 dark:border-slate-700/40 px-4 py-3 lg:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
