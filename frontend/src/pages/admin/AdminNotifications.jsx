import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { BRANCHES } from '../../utils/constants';

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '', branch: '' });

  const send = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/notifications/bulk', form);
      toast.success(data.message);
      setForm({ title: '', message: '', branch: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Card title="Send Notification" subtitle="Broadcast to students">
      <form onSubmit={send} className="space-y-4 max-w-lg">
        <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label className="block text-sm font-medium">Message
          <textarea className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </label>
        <label className="text-sm">Branch (optional)
          <select className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-slate-800" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
            <option value="">All branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}
