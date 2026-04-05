import io from 'socket.io-client';

/**
 * WebSocket Service - Handle real-time updates
 */

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Task update events
export const subscribeToTaskUpdates = (callback) => {
  if (socket) {
    socket.on('task_update', callback);
  }
};

export const subscribeToTaskCreated = (callback) => {
  if (socket) {
    socket.on('task_created', callback);
  }
};

export const subscribeToTaskCompleted = (callback) => {
  if (socket) {
    socket.on('task_completed', callback);
  }
};

// Broadcast methods
export const emitTaskUpdate = (data) => {
  if (socket) {
    socket.emit('task_update', data);
  }
};

export const emitMessage = (type, data) => {
  if (socket) {
    socket.emit('message', { type, data });
  }
};
