import apiClient from './api';

/**
 * Task Service - Handle task operations
 */

// Get all tasks
export const getAllTasks = async (filters = {}) => {
  try {
    const response = await apiClient.get('/tasks/', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get today's tasks
export const getTodayTasks = async () => {
  try {
    const response = await apiClient.get('/tasks/today/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new task
export const createTask = async (taskData) => {
  try {
    const response = await apiClient.post('/tasks/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.put(`/tasks/${taskId}/`, taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    await apiClient.delete(`/tasks/${taskId}/`);
    return true;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark task as completed
export const markTaskComplete = async (taskId, notes = '') => {
  try {
    const response = await apiClient.post(`/tasks/${taskId}/mark-complete/`, {
      notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Skip task
export const skipTask = async (taskId) => {
  try {
    const response = await apiClient.post(`/tasks/${taskId}/skip/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reschedule task
export const rescheduleTask = async (taskId, scheduledTime, reason = '') => {
  try {
    const response = await apiClient.post(`/tasks/${taskId}/reschedule/`, {
      scheduled_time: scheduledTime,
      reason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    const response = await apiClient.get('/tasks/stats/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get overdue tasks
export const getOverdueTasks = async () => {
  try {
    const response = await apiClient.get('/tasks/overdue/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
