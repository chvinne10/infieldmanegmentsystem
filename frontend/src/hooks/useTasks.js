/**
 * Custom hook for managing tasks
 */
import { useState, useEffect } from 'react';
import {
  getAllTasks,
  getTodayTasks,
  getTaskStats,
  getOverdueTasks,
} from '../services/taskService';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = async (filter = {}) => {
    try {
      setLoading(true);
      const data = await getAllTasks(filter);
      setTasks(data.results || []);
      setError(null);
    } catch (err) {
      setError(err?.detail || 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return { tasks, loading, error, loadTasks };
};

/**
 * Custom hook for task statistics
 */
export const useTaskStats = () => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    today_tasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getTaskStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading };
};

/**
 * Custom hook for today's tasks
 */
export const useTodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTodayTasks();
      setTasks(data.results || []);
      setError(null);
    } catch (err) {
      setError(err?.detail || 'Failed to load today\'s tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { tasks, loading, error, reload: load };
};

/**
 * Custom hook for notifications
 */
import {
  getUnreadNotifications,
  markAllNotificationsAsRead,
} from '../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      setNotifications(data.results || []);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAllRead,
  };
};
