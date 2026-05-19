import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useSocket } from '../hooks/useSocket';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/applications': 'Applications',
  '/admin/companies': 'Companies',
  '/admin/drives': 'Placement Drives',
  '/admin/analytics': 'Analytics',
  '/admin/reports': 'Reports',
  '/admin/notifications': 'Inbox',
  '/admin/broadcast': 'Broadcast',
  '/admin/settings': 'Settings',
  '/student/dashboard': 'Dashboard',
  '/student/profile': 'Profile',
  '/student/companies': 'Companies',
  '/student/applications': 'Applications',
  '/student/resume': 'Resume & AI',
  '/student/notifications': 'Notifications',
  '/student/settings': 'Settings',
};

export default function DashboardLayout({ title: layoutTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  useSocket();

  const pageTitle = PAGE_TITLES[location.pathname] || layoutTitle;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar role={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
