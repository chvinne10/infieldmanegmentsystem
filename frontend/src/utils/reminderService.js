/**
 * Reminder Service - Send reminders before task time
 */

const REMINDER_TIMES = {
  BEFORE_5_MIN: 5 * 60 * 1000, // 5 minutes
  BEFORE_15_MIN: 15 * 60 * 1000, // 15 minutes
  BEFORE_30_MIN: 30 * 60 * 1000, // 30 minutes
  BEFORE_1_HOUR: 60 * 60 * 1000, // 1 hour
};

const reminders = new Map(); // Store active reminders

export const setTaskReminder = (task, beforeMs = REMINDER_TIMES.BEFORE_15_MIN) => {
  const taskId = task.id;

  // Clear existing reminder
  if (reminders.has(taskId)) {
    clearTimeout(reminders.get(taskId));
  }

  const scheduledTime = new Date(task.scheduled_time).getTime();
  const now = new Date().getTime();
  const reminderTime = scheduledTime - beforeMs;

  if (reminderTime > now) {
    const timeout = setTimeout(() => {
      sendReminder(task);
    }, reminderTime - now);

    reminders.set(taskId, timeout);
  }
};

export const sendReminder = (task) => {
  // Send notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Upcoming: ${task.title}`, {
      body: `Task at ${new Date(task.scheduled_time).toLocaleTimeString()} - ${task.client_name}`,
      tag: `task-${task.id}`,
      requireInteraction: true,
    });
  }

  // Speak reminder if voice enabled
  try {
    const utterance = new SpeechSynthesisUtterance(
      `Reminder: You have a task coming up. ${task.title} with ${task.client_name}.`
    );
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error speaking reminder:', error);
  }
};

export const clearTaskReminder = (taskId) => {
  if (reminders.has(taskId)) {
    clearTimeout(reminders.get(taskId));
    reminders.delete(taskId);
  }
};

export const clearAllReminders = () => {
  reminders.forEach((timeout) => clearTimeout(timeout));
  reminders.clear();
};
