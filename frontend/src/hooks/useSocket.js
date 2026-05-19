import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from '../services/socket';
import { addNotification, fetchNotifications } from '../redux/slices/notificationSlice';

export function useSocket() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !user?._id) return;

    const socket = connectSocket(user.role === 'admin');
    dispatch(fetchNotifications());

    socket?.on('notification', (data) => {
      dispatch(addNotification(data));
      toast(data.title, { icon: '🔔' });
    });

    socket?.on('new-drive', (drive) => {
      if (user.role === 'student') {
        toast(`New drive: ${drive.companyName}`, { icon: '🏢' });
      }
    });

    socket?.on('new-application', () => {
      if (user.role === 'admin') {
        toast('New application received', { icon: '📝' });
      }
    });

    return () => disconnectSocket();
  }, [token, user?._id, user?.role, dispatch]);
}
