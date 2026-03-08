export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  startDate: string; // "YYYY-MM-DD"
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number[]; // 0=Mon...6=Sun for custom frequency
  completionDates: string[]; // ["YYYY-MM-DD", ...]
  streakFreezes: string[]; // dates where freeze was used
  notes: Record<string, string>; // date -> note
  archived: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  habitId: string;
  time: string; // "HH:MM"
  days: number[]; // 0=Mon...6=Sun
}

const HABITS_KEY = 'habitgrid_habits';
const REMINDERS_KEY = 'habitgrid_reminders';
const ONBOARDING_KEY = 'habitgrid_onboarding_done';

export function getHabits(): Habit[] {
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getReminders(): Reminder[] {
  const data = localStorage.getItem(REMINDERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Streak calculations
export function getCurrentStreak(habit: Habit): number {
  const completions = new Set(habit.completionDates);
  const freezes = new Set(habit.streakFreezes);
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = formatDate(d);

    if (ds < habit.startDate) break;

    if (!shouldTrackDay(habit, d)) continue;

    if (completions.has(ds) || freezes.has(ds)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getLongestStreak(habit: Habit): number {
  const completions = new Set(habit.completionDates);
  const freezes = new Set(habit.streakFreezes);
  let longest = 0;
  let current = 0;

  const start = new Date(habit.startDate);
  const end = new Date();

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!shouldTrackDay(habit, d)) continue;
    const ds = formatDate(d);
    if (completions.has(ds) || freezes.has(ds)) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

export function getCompletionRate(habit: Habit): number {
  const start = new Date(habit.startDate);
  const end = new Date();
  let tracked = 0;
  let completed = 0;
  const completions = new Set(habit.completionDates);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (!shouldTrackDay(habit, d)) continue;
    tracked++;
    if (completions.has(formatDate(d))) completed++;
  }
  return tracked > 0 ? Math.round((completed / tracked) * 100) : 0;
}

function shouldTrackDay(habit: Habit, date: Date): boolean {
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekly') {
    // Weekly habits are tracked once per week (Mon-Sun).
    // Only the Monday of each week is the "checkpoint" for streak purposes.
    const day = date.getDay();
    const jsToCustom = day === 0 ? 6 : day - 1;
    return jsToCustom === 0; // Monday is the checkpoint day
  }
  if (habit.frequency === 'custom') {
    const day = date.getDay();
    const jsToCustom = day === 0 ? 6 : day - 1;
    return habit.customDays.includes(jsToCustom);
  }
  return true;
}

// For weekly habits: check if any day in the same week (Mon-Sun) has a completion
export function isWeekCompleted(habit: Habit, date: Date): boolean {
  if (habit.frequency !== 'weekly') return false;
  const completions = new Set(habit.completionDates);
  const monday = getMonday(date);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    if (completions.has(formatDate(d))) return true;
  }
  return false;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function exportDataCSV(habits: Habit[]): string {
  let csv = 'Habit Name,Icon,Color,Start Date,Frequency,Total Completions,Current Streak,Longest Streak,Completion Rate\n';
  habits.forEach(h => {
    csv += `"${h.name}",${h.icon},${h.color},${h.startDate},${h.frequency},${h.completionDates.length},${getCurrentStreak(h)},${getLongestStreak(h)},${getCompletionRate(h)}%\n`;
  });
  return csv;
}

export function exportAllData(): string {
  return JSON.stringify({ habits: getHabits(), reminders: getReminders(), exportedAt: new Date().toISOString() }, null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.habits) saveHabits(data.habits);
    if (data.reminders) saveReminders(data.reminders);
    return true;
  } catch { return false; }
}

export const HABIT_COLORS = [
  { name: 'Green', value: '#4CAF50' },
  { name: 'Mint', value: '#66BB6A' },
  { name: 'Teal', value: '#26A69A' },
  { name: 'Blue', value: '#42A5F5' },
  { name: 'Indigo', value: '#5C6BC0' },
  { name: 'Purple', value: '#AB47BC' },
  { name: 'Pink', value: '#EC407A' },
  { name: 'Red', value: '#EF5350' },
  { name: 'Orange', value: '#FFA726' },
  { name: 'Amber', value: '#FFCA28' },
  { name: 'Lime', value: '#9CCC65' },
  { name: 'Cyan', value: '#26C6DA' },
];

export const HABIT_ICONS = [
  '💪', '🏃', '📖', '🧘', '💧', '🍎', '💊', '🎯', '✍️', '🎵',
  '🌱', '☕', '🧠', '❤️', '🔥', '⭐', '💤', '🚶', '🏋️', '🚴',
  '🧹', '📝', '💻', '🎨', '📸', '🍳', '🦷', '🙏', '🎸', '🏊',
];
