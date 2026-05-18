import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socket;

export const connectSocket = (userId, isAdmin = false) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    if (userId) socket.emit('join', userId);
    if (isAdmin) socket.emit('join-admin');
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
