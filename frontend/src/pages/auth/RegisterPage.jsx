import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser } from '../../redux/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { BRANCHES } from '../../utils/constants';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', rollNumber: '', branch: 'CSE', cgpa: '', phone: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser({ ...form, cgpa: Number(form.cgpa) }));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created!');
      navigate('/student/dashboard');
    } else toast.error(result.payload);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">Student Registration</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input label="Roll Number" required value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <label className="block text-sm font-medium">
          Branch
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <Input label="CGPA" type="number" step="0.01" min="0" max="10" required value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
        <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-primary-600">Already have an account?</Link></p>
    </section>
  );
}
