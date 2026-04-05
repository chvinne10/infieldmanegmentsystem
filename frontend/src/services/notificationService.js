import apiClient from './api';

/**
 * Notification Service - Handle notifications
 */

// Get all notifications
export const getNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get unread notifications
export const getUnreadNotifications = async () => {
  try {
    const response = await apiClient.get('/notifications/unread/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.post(
      `/notifications/${notificationId}/mark-as-read/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.post(
      '/notifications/mark-all-as-read/'
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    await apiClient.delete('/notifications/clear-all/');
    return true;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
