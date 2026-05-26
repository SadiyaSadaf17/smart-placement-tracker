import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import {
  LayoutDashboard, User, Building2, FileText, Bell, FileUp,
  Users, BarChart3, Download, Briefcase, ClipboardList, Settings, Megaphone, Gauge, Award, ShieldCheck, CalendarDays, Target, GraduationCap,
  ListChecks,
} from 'lucide-react';
import { hasPermission, isStaffRole, PERMISSIONS } from '../../utils/rbac';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/companies', label: 'Companies', icon: Building2 },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/history', label: 'History', icon: ClipboardList },
  { to: '/student/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/student/development', label: 'Development', icon: GraduationCap },
  { to: '/student/assessments', label: 'Assessments', icon: ListChecks },
  { to: '/student/resume', label: 'Resume & AI', icon: FileUp },
  { to: '/student/readiness', label: 'Readiness', icon: Gauge },
  { to: '/student/offers', label: 'Offers', icon: Award },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
  { to: '/admin/students', label: 'Students', icon: Users, permission: PERMISSIONS.VIEW_STUDENTS },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList, permission: PERMISSIONS.VIEW_APPLICATIONS },
  { to: '/admin/eligibility', label: 'Eligibility', icon: Target, permission: PERMISSIONS.VIEW_STUDENTS },
  { to: '/admin/scheduler', label: 'Scheduler', icon: CalendarDays, permission: PERMISSIONS.VIEW_APPLICATIONS },
  { to: '/admin/offers', label: 'Offers', icon: Award, permission: PERMISSIONS.VIEW_OFFERS },
  { to: '/admin/companies', label: 'Companies', icon: Briefcase, permission: PERMISSIONS.VIEW_DRIVES },
  { to: '/admin/drives', label: 'Drives', icon: Building2, permission: PERMISSIONS.VIEW_DRIVES },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: PERMISSIONS.VIEW_ANALYTICS },
  { to: '/admin/reports', label: 'Reports', icon: Download, permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/admin/audit', label: 'Audit', icon: ShieldCheck, permission: PERMISSIONS.VIEW_AUDIT_LOGS },
  { to: '/admin/policies', label: 'Policies', icon: Settings, permission: PERMISSIONS.MANAGE_DRIVES },
  { to: '/admin/enterprise', label: 'Enterprise', icon: GraduationCap, permission: PERMISSIONS.VIEW_REPORTS },
  { to: '/admin/assessments', label: 'Assessments', icon: ListChecks, permission: PERMISSIONS.MANAGE_STUDENTS },
  { to: '/admin/notifications', label: 'Inbox', icon: Bell, permission: PERMISSIONS.VIEW_DASHBOARD },
  { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone, permission: PERMISSIONS.SEND_NOTIFICATIONS },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ role, open, onClose }) {
  const links = isStaffRole(role)
    ? adminLinks.filter((link) => !link.permission || hasPermission(role, link.permission))
    : studentLinks;
  const { profile, user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const initial = (profile?.fullName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden" 
          onClick={onClose} 
          aria-hidden 
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/60 dark:border-slate-700/40 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur transition-all duration-300 ease-out dark:shadow-2xl lg:static lg:translate-x-0 lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-200/40 dark:border-slate-700/40 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H3a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h14a1.5 1.5 0 001.5-1.5V8.5M10.5 1.5v6h6M10.5 1.5L16.5 7.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">PT</p>
                <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{user?.role}</p>
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            >
              <X size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {label === 'Inbox' && unreadCount > 0 && (
                <span className="ml-auto rounded-full bg-gradient-to-r from-red-500 to-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/40 dark:border-slate-700/40 p-4 space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/40 p-4 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {profile?.fullName || 'User'}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
