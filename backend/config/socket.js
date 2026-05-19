import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('Unauthorized'));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', () => {
      if (socket.userId) socket.join(`user:${socket.userId}`);
    });

    socket.on('join-admin', () => {
      if (socket.userRole === 'admin') socket.join('admin-room');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data);
};

export const emitToAdmin = (event, data) => {
  if (io) io.to('admin-room').emit(event, data);
};
