/**
 * Utility functions for date and time
 */

import { formatDistanceToNow, format, parse, isBefore } from 'date-fns';

export const formatDateTime = (dateString) => {
  try {
    return format(new Date(dateString), 'PPp');
  } catch {
    return 'Invalid date';
  }
};

export const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'PPP');
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (dateString) => {
  try {
    return format(new Date(dateString), 'p');
  } catch {
    return 'Invalid time';
  }
};

export const getTimeWithoutSeconds = (dateString) => {
  try {
    return format(new Date(dateString), 'HH:mm');
  } catch {
    return 'Invalid time';
  }
};

export const isOverdue = (scheduledTime) => {
  return isBefore(new Date(scheduledTime), new Date());
};

export const getRelativeTime = (dateString) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
