import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">Reset Password</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="New Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-primary-600">Login</Link></p>
    </section>
  );
}
