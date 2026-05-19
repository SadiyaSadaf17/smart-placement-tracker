import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun, User, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Account preferences and appearance" />

      <Card title="Profile" subtitle="Your account information">
        <section className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white">
            {(profile?.fullName || user?.email || '?').charAt(0).toUpperCase()}
          </span>
          <section>
            <p className="font-semibold">{profile?.fullName || '—'}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-blue-600">{user?.role} account</p>
          </section>
        </section>
        {user?.role === 'student' && profile?.rollNumber && (
          <p className="mt-3 text-sm text-slate-500">
            {profile.rollNumber} · {profile.branch} · CGPA {profile.cgpa}
          </p>
        )}
      </Card>

      <Card title="Appearance">
        <section className="flex items-center justify-between">
          <section className="flex items-center gap-3">
            {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="text-sm font-medium">Theme: {mode === 'dark' ? 'Dark' : 'Light'}</span>
          </section>
          <Button variant="outline" size="sm" onClick={() => dispatch(toggleTheme())}>
            Toggle theme
          </Button>
        </section>
      </Card>

      <Card title="Security">
        <section className="flex items-center gap-3 text-sm text-slate-500">
          <Shield size={18} />
          <span>Sessions use JWT tokens. Log out to end your session on this device.</span>
        </section>
        <Button variant="danger" className="mt-4" onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </section>
  );
}
