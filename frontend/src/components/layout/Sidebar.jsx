import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, User, Building2, FileText, Bell, FileUp,
  Users, BarChart3, Download, Briefcase,
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/companies', label: 'Companies', icon: Building2 },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/resume', label: 'Resume', icon: FileUp },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/companies', label: 'Companies', icon: Briefcase },
  { to: '/admin/drives', label: 'Drives', icon: Building2 },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports', icon: Download },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar({ role, open, onClose }) {
  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
  <>
    {open && (
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
    )}
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-700 dark:bg-slate-900 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">PT</div>
        <span className="font-semibold">Placement Tracker</span>
      </div>
      <nav className="space-y-1 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
  );
}
