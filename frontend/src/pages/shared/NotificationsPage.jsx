import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { fetchNotifications, markRead, deleteNotification } from '../../redux/slices/notificationSlice';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    dispatch(markRead(id));
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    dispatch(fetchNotifications());
  };

  const deleteOne = async (id) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err || 'Failed to delete notification');
    }
  };

  return (
    <section className="space-y-4">
      <section className="flex justify-end">
        <Button variant="outline" size="sm" onClick={markAll}>Mark all read</Button>
      </section>
      {loading && <p>Loading...</p>}
      {items.map((n) => (
        <Card key={n._id} title={n.title} action={!n.isRead && <Badge variant="info">New</Badge>}>
          <p className="text-sm text-slate-600 dark:text-slate-400">{n.message}</p>
          <p className="mt-2 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
          <section className="mt-3 flex gap-2">
            {!n.isRead && <Button size="sm" variant="ghost" onClick={() => markOne(n._id)}>Mark read</Button>}
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              onClick={() => deleteOne(n._id)}
            >
              <Trash2 size={16} className="mr-1 inline" /> Delete
            </Button>
          </section>
        </Card>
      ))}
      {!items.length && !loading && <p className="text-slate-500">No notifications</p>}
    </section>
  );
}
