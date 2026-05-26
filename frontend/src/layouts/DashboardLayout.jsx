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
  '/admin/eligibility': 'Eligibility',
  '/admin/scheduler': 'Scheduler',
  '/admin/offers': 'Offers',
  '/admin/companies': 'Companies',
  '/admin/drives': 'Placement Drives',
  '/admin/analytics': 'Analytics',
  '/admin/reports': 'Reports',
  '/admin/audit': 'Audit Logs',
  '/admin/policies': 'Policies',
  '/admin/enterprise': 'Enterprise Tools',
  '/admin/notifications': 'Inbox',
  '/admin/broadcast': 'Broadcast',
  '/admin/settings': 'Settings',
  '/student/dashboard': 'Dashboard',
  '/student/change-password': 'Change Password',
  '/student/profile': 'Profile',
  '/student/companies': 'Companies',
  '/student/applications': 'Applications',
  '/student/history': 'Application History',
  '/student/schedule': 'Schedule',
  '/student/development': 'Development',
  '/student/resume': 'Resume & AI',
  '/student/readiness': 'Readiness',
  '/student/offers': 'Offers',
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar role={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen w-full flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
