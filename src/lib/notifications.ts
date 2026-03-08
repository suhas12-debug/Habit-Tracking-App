import { LocalNotifications } from '@capacitor/local-notifications';
import { Habit } from './storage';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    // Web fallback - try browser notifications
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }
}

export async function scheduleHabitReminders(habits: Habit[]) {
  try {
    // Cancel all existing notifications first
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications: any[] = [];
    let notifId = 1;

    habits.forEach(habit => {
      habit.reminders.forEach(reminder => {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        
        reminder.days.forEach(day => {
          // day: 0=Mon...6=Sun, JS: 0=Sun...6=Sat
          const jsDay = day === 6 ? 0 : day + 1;
          
          notifications.push({
            id: notifId++,
            title: `${habit.icon} ${habit.name}`,
            body: habit.description || `Time to complete your habit!`,
            schedule: {
              on: {
                weekday: jsDay === 0 ? 1 : jsDay + 1, // Capacitor uses 1=Sun
                hour: hours,
                minute: minutes,
              },
              repeats: true,
            },
            sound: 'default',
          });
        });
      });
    });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (e) {
    console.log('Native notifications not available, using web fallback');
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
