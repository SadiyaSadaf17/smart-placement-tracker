import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If email exists, reset link sent');
    } catch {
      toast.error('Request failed');
    }
    setLoading(false);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
      </form>
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-primary-600">Back to login</Link></p>
    </section>
  );
}
