import { Habit } from './storage';
import type { CalendarReminder } from './storage';

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

export async function scheduleCalendarReminder(reminder: CalendarReminder) {
  if (!('Notification' in window)) return;

  const permission = await requestNotificationPermission();
  if (!permission) return;

  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const targetTime = new Date(year, month - 1, day, hours, minutes).getTime();
  const now = Date.now();
  const delay = targetTime - now;

  if (delay <= 0) return; // Already passed

  setTimeout(() => {
    new Notification('HabitGrid Reminder 🔔', {
      body: reminder.title,
      icon: '/favicon.ico',
    });
  }, delay);
}

// Check and fire any pending reminders on app load
export function initReminderChecker() {
  try {
    const data = localStorage.getItem('habitgrid_calendar_reminders');
    if (!data) return;
    const reminders: CalendarReminder[] = JSON.parse(data);
    reminders.forEach(r => {
      if (!r.notified) {
        scheduleCalendarReminder(r);
      }
    });
  } catch {
    // silently fail
  }
}
