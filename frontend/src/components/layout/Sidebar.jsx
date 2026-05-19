import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, User, Building2, FileText, Bell, FileUp,
  Users, BarChart3, Download, Briefcase, ClipboardList, Settings, Megaphone,
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/companies', label: 'Companies', icon: Building2 },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/resume', label: 'Resume & AI', icon: FileUp },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/companies', label: 'Companies', icon: Briefcase },
  { to: '/admin/drives', label: 'Drives', icon: Building2 },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports', icon: Download },
  { to: '/admin/notifications', label: 'Inbox', icon: Bell },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ role, open, onClose }) {
  const links = role === 'admin' ? adminLinks : studentLinks;
  const { profile, user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const initial = (profile?.fullName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <header className="border-b border-slate-200/80 px-5 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
              PT
            </span>
            <span>
              <p className="font-semibold text-slate-900 dark:text-white">Placement Tracker</p>
              <p className="text-xs capitalize text-slate-500">{user?.role} portal</p>
            </span>
          </div>
        </header>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Inbox' && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <footer className="border-t border-slate-200/80 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {initial}
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.fullName || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </span>
          </div>
        </footer>
      </aside>
    </>
  );
}
