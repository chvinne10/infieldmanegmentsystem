/**
 * Notification Service - Push Notifications
 */

export const initializePushNotifications = async (token) => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  try {
    // Check if notification permission is already granted
    if (Notification.permission === 'granted') {
      return;
    }

    // Request permission
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Send FCM token to backend
        // This would be done through the user service
      }
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

export const sendNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...options,
        });
      });
    } else {
      new Notification(title, options);
    }
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};
