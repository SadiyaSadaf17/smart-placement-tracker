import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { isStaffRole } from '../../utils/rbac';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      const role = result.payload.user.role;
      navigate(isStaffRole(role) ? '/admin/dashboard' : '/student/dashboard');
    } else toast.error(result.payload || 'Login failed');
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">Sign in</h2>
      <p className="mt-1 text-sm text-slate-500">Access your placement dashboard</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link>
      </p>
    </section>
  );
}
