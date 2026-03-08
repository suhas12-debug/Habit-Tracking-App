import { Habit } from './storage';

export async function scheduleHabitReminders(_habits: Habit[]) {
  console.log('Notification scheduling available when running natively');
}

export async function requestNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export async function checkNotificationPermission(): Promise<boolean> {
  if ('Notification' in window) {
    return Notification.permission === 'granted';
  }
  return false;
}
