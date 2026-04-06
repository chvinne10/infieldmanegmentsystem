import apiClient from './api';

/**
 * User Service - Handle authentication and user management
 */

// Register new user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/users/register/', userData);
    const { access, refresh, user } = response.data;
    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Login user
export const loginUser = async (username, password) => {
  try {
    const response = await apiClient.post('/users/token/', {
      username,
      password,
    });
    // Save tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update FCM token
export const updateFCMToken = async (fcmToken) => {
  try {
    const response = await apiClient.post('/users/update-fcm-token/', {
      fcm_token: fcmToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Get all users (managers only)
export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all employees (managers only)
export const getAllEmployees = async () => {
  try {
    const response = await apiClient.get('/users/employees/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all managers
export const getAllManagers = async () => {
  try {
    const response = await apiClient.get('/users/managers/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
