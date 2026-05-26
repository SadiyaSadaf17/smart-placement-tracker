import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { updateAuthSession } from '../../redux/slices/authSlice';

const initialForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ForceChangePasswordPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.currentPassword) nextErrors.currentPassword = 'Current password is required';
    if (form.newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters';
    if (form.newPassword === 'student123') nextErrors.newPassword = 'Choose a password different from the default';
    if (form.currentPassword && form.currentPassword === form.newPassword) {
      nextErrors.newPassword = 'Use a different password';
    }
    if (form.newPassword !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const { data } = await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      dispatch(updateAuthSession({ user: data.user, token: data.token }));
      toast.success('Password updated. Your account is ready.');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not change password';
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="w-full max-w-xl" hoverable={false}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Your Password</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email} must replace the default password before using the portal.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <Input
            label="Current Password"
            type="password"
            value={form.currentPassword}
            error={errors.currentPassword}
            onChange={(event) => updateField('currentPassword', event.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            value={form.newPassword}
            error={errors.newPassword}
            hint="Use at least 8 characters with uppercase, lowercase, number, and symbol."
            onChange={(event) => updateField('newPassword', event.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
          />

          {errors.form && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {errors.form}
            </p>
          )}

          <Button type="submit" className="w-full" loading={saving}>
            Update Password
          </Button>
        </form>
      </Card>
    </main>
  );
}
