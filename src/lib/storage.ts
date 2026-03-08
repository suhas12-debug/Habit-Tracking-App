export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  streakGoal: 'none' | 'daily' | 'weekly' | 'monthly';
  category: string;
  completionsPerDay: number;
  weeklyGoal: number; // target completions per week, 0 = no goal
  reminders: Reminder[];
  completions: Record<string, number>; // "YYYY-MM-DD" -> completion count
  createdAt: string;
}

export interface Reminder {
  id: string;
  days: number[]; // 0=Mon, 1=Tue...6=Sun
  time: string; // "HH:MM"
}

export interface CalendarNote {
  id: string;
  date: string; // "YYYY-MM-DD"
  text: string;
  reminder: boolean;
}

const HABITS_KEY = 'habitkit_habits';
const NOTES_KEY = 'habitkit_notes';

export function getHabits(): Habit[] {
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHabits(habits: Habit[]) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getNotes(): CalendarNote[] {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveNotes(notes: CalendarNote[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getStartDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export const HABIT_COLORS = [
  { name: 'Red', hsl: '0 85% 60%' },
  { name: 'Orange', hsl: '25 95% 55%' },
  { name: 'Amber', hsl: '38 95% 55%' },
  { name: 'Yellow', hsl: '48 95% 55%' },
  { name: 'Lime', hsl: '80 80% 50%' },
  { name: 'Green', hsl: '142 70% 45%' },
  { name: 'Emerald', hsl: '160 84% 39%' },
  { name: 'Cyan', hsl: '180 70% 45%' },
  { name: 'Teal', hsl: '170 70% 45%' },
  { name: 'Blue', hsl: '217 91% 60%' },
  { name: 'Indigo', hsl: '239 84% 67%' },
  { name: 'Violet', hsl: '263 70% 60%' },
  { name: 'Purple', hsl: '270 70% 55%' },
  { name: 'Pink', hsl: '330 80% 60%' },
  { name: 'Rose', hsl: '350 80% 60%' },
  { name: 'Coral', hsl: '16 85% 65%' },
  { name: 'Slate', hsl: '215 14% 55%' },
  { name: 'Gray', hsl: '220 9% 46%' },
  { name: 'Stone', hsl: '25 5% 50%' },
  { name: 'Warm', hsl: '30 6% 55%' },
];

export const HABIT_ICONS = [
  '💪', '🏃', '📖', '🧘', '💧', '🍎', '💊', '🎯', '✍️', '🎵',
  '🎸', '🌱', '☕', '🧠', '❤️', '🔥', '⭐', '🌟', '💤', '🚶',
  '🏋️', '🚴', '🧹', '📝', '💻', '🎨', '📸', '🍳', '🦷', '🙏',
];

export const CATEGORIES = [
  'Health', 'Fitness', 'Mindfulness', 'Productivity', 'Learning',
  'Creative', 'Social', 'Finance', 'Self-care', 'Other'
];

export function exportAllData(): string {
  const data = {
    habits: getHabits(),
    notes: getNotes(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}
