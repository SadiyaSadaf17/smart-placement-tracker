import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socket;

export const connectSocket = (isAdmin = false) => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
  });

  socket.on('connect', () => {
    socket.emit('join');
    if (isAdmin) socket.emit('join-admin');
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection failed:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
