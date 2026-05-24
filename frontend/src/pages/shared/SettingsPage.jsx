import { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, Moon, Shield, Sun, Trash2, Upload } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout, updateAuthUser } from '../../redux/slices/authSlice';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, profile } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSaving, setImageSaving] = useState(false);

  const displayName = profile?.fullName || user?.email || 'User';
  const selectedImageName = useMemo(() => imageFile?.name || '', [imageFile]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.currentPassword && passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'Use a different password';
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (!validatePassword()) return;

    try {
      setPasswordSaving(true);
      const { data } = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (data.user) dispatch(updateAuthUser(data.user));
      setPasswordForm(initialPasswordForm);
      toast.success(data.message || 'Password changed successfully');
    } catch (error) {
      const message = error.response?.data?.message || 'Could not change password';
      setPasswordErrors({ form: message });
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Upload a JPG, PNG, or WEBP image');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 2 MB or smaller');
      event.target.value = '';
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveImage = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('avatar', imageFile);

    try {
      setImageSaving(true);
      const { data } = await api.put('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(updateAuthUser(data.user));
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(data.message || 'Profile image updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setImageSaving(false);
    }
  };

  const removeImage = async () => {
    try {
      setImageSaving(true);
      const { data } = await api.delete('/auth/profile-image');
      dispatch(updateAuthUser(data.user));
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(data.message || 'Profile image removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove image');
    } finally {
      setImageSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Settings" description="Account preferences, profile image, and security" />

      <Card title="Profile" subtitle="Your account information and profile photo">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar src={imagePreview || user?.profileImage} name={displayName} size="lg" />
          <section className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="mt-1 text-xs capitalize text-blue-600 dark:text-blue-400">{user?.role} account</p>
            {user?.role === 'student' && profile?.rollNumber && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {profile.rollNumber} | {profile.branch} | CGPA {profile.cgpa}
              </p>
            )}
          </section>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500">
            <Camera size={18} />
            <span className="truncate">{selectedImageName || 'Choose profile image'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleImageSelect}
            />
          </label>
          <Button type="button" icon={Upload} loading={imageSaving} disabled={!imageFile} onClick={saveImage}>
            Save image
          </Button>
          <Button
            type="button"
            variant="outline"
            icon={Trash2}
            loading={imageSaving}
            disabled={!user?.profileImage && !imageFile}
            onClick={removeImage}
          >
            Remove
          </Button>
        </section>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          JPG, PNG, or WEBP only. Maximum size 2 MB.
        </p>
      </Card>

      <Card title="Appearance">
        <section className="flex items-center justify-between gap-4">
          <section className="flex items-center gap-3">
            {mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <span className="text-sm font-medium">Theme: {mode === 'dark' ? 'Dark' : 'Light'}</span>
          </section>
          <Button type="button" variant="outline" size="sm" onClick={() => dispatch(toggleTheme())}>
            Toggle theme
          </Button>
        </section>
      </Card>

      <Card title="Change Password" subtitle="Use a strong password that is not reused elsewhere">
        <form className="space-y-4" onSubmit={submitPassword}>
          <section className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              error={passwordErrors.currentPassword}
              onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              error={passwordErrors.newPassword}
              hint="Minimum 6 characters"
              onChange={(e) => updatePasswordField('newPassword', e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              error={passwordErrors.confirmPassword}
              onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
            />
          </section>
          {passwordErrors.form && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-300">
              {passwordErrors.form}
            </p>
          )}
          <Button type="submit" loading={passwordSaving}>
            Update password
          </Button>
        </form>
      </Card>

      <Card title="Security">
        <section className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Shield size={18} />
          <span>Sessions use JWT tokens. Log out to end your session on this device.</span>
        </section>
        <Button type="button" variant="danger" className="mt-4" onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </section>
  );
}
