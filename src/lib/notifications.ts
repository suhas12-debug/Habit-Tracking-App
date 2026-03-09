import { LocalNotifications } from '@capacitor/local-notifications';
import { Habit } from './storage';
import type { CalendarReminder } from './storage';

export async function scheduleHabitReminders(_habits: Habit[]) {
  console.log('Notification scheduling available when running natively');
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    // Fallback to web API
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }
}

export async function scheduleCalendarReminder(reminder: CalendarReminder) {
  const permission = await requestNotificationPermission();
  if (!permission) return;

  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const targetTime = new Date(year, month - 1, day, hours, minutes);

  if (targetTime.getTime() <= Date.now()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'HabitKit Reminder 🔔',
          body: reminder.title,
          id: hashStringToInt(reminder.id),
          schedule: { at: targetTime },
          sound: undefined,
          smallIcon: 'ic_launcher',
        },
      ],
    });
  } catch {
    // Fallback to web notification
    const delay = targetTime.getTime() - Date.now();
    if (delay > 0 && 'Notification' in window) {
      setTimeout(() => {
        new Notification('HabitKit Reminder 🔔', {
          body: reminder.title,
          icon: '/favicon.ico',
        });
      }, delay);
    }
  }
}

// Convert string ID to a numeric ID for Capacitor
function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

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
