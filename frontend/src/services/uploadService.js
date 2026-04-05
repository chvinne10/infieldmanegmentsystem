import apiClient from './api';

/**
 * Upload Service - Handle schedule uploads and OCR
 */

// Upload schedule image
export const uploadScheduleImage = async (formData) => {
  try {
    const response = await apiClient.post('/uploads/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Process upload with OCR
export const processScheduleUpload = async (uploadId) => {
  try {
    const response = await apiClient.post(`/uploads/${uploadId}/process/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get upload details
export const getUploadDetails = async (uploadId) => {
  try {
    const response = await apiClient.get(`/uploads/${uploadId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get suggested tasks from upload
export const getUploadTasks = async (uploadId) => {
  try {
    const response = await apiClient.get(`/uploads/${uploadId}/tasks/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all uploads
export const getAllUploads = async () => {
  try {
    const response = await apiClient.get('/uploads/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get recent uploads
export const getRecentUploads = async () => {
  try {
    const response = await apiClient.get('/uploads/recent/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get upload statistics
export const getUploadStats = async () => {
  try {
    const response = await apiClient.get('/uploads/stats/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
