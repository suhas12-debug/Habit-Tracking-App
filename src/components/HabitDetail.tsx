import { X, Edit3, Trash2, Snowflake, StickyNote } from 'lucide-react';
import { Habit, formatDate, getCurrentStreak, getLongestStreak, getCompletionRate } from '@/lib/storage';
import { ContributionGrid } from './ContributionGrid';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';

interface HabitDetailProps {
  habit: Habit;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggleDate: (id: string, date: string) => void;
  onStreakFreeze: (id: string) => void;
  onRemoveFreeze: (id: string, date: string) => void;
}

export function HabitDetail({ habit, onClose, onEdit, onDelete, onToggleDate, onStreakFreeze, onRemoveFreeze }: HabitDetailProps) {
  const today = formatDate(new Date());
  const isCompleteToday = habit.completionDates.includes(today);
  const streak = getCurrentStreak(habit);
  const longest = getLongestStreak(habit);
  const rate = getCompletionRate(habit);
  const total = habit.completionDates.length;

  // Weekly data for chart
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = formatDate(d);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      done: habit.completionDates.includes(ds) ? 1 : 0,
    };
  });

  // Monthly completion for last 4 months
  const monthlyData = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (3 - i));
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (habit.completionDates.includes(ds)) completed++;
    }
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      rate: Math.round((completed / daysInMonth) * 100),
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-slide-up">
      <div className="min-h-full p-5 max-w-lg mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => onStreakFreeze(habit.id)} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <Snowflake className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => onEdit(habit)} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => { onDelete(habit.id); onClose(); }} className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.icon}
          </div>
          <h2 className="text-xl font-bold text-foreground">{habit.name}</h2>
        </div>

        {/* Big Streak */}
        <div className="text-center mb-8">
          <p className="streak-number animate-streak-count" style={{ color: habit.color }}>
            {streak}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Current Streak</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{longest}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{rate}%</p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>

        {/* Mark Today */}
        <button
          onClick={() => onToggleDate(habit.id, today)}
          className={`w-full rounded-xl py-4 font-semibold text-base mb-8 transition-all active:scale-[0.98] ${
            isCompleteToday
              ? 'bg-card border border-border text-foreground'
              : 'text-primary-foreground'
          }`}
          style={!isCompleteToday ? { backgroundColor: habit.color } : {}}
        >
          {isCompleteToday ? '✓ Completed Today' : 'Mark Today Complete'}
        </button>

        {/* Contribution Grid - Full width */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">{new Date().getFullYear()} Tracking</h3>
          <ContributionGrid
            habit={habit}
            onToggle={(date) => onToggleDate(habit.id, date)}
          />
        </div>

        {/* Weekly Progress */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">This Week</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="done" fill={habit.color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Completion</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Bar dataKey="rate" fill={`${habit.color}99`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Streak Freezes */}
        {habit.streakFreezes.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Snowflake className="w-4 h-4" /> Streak Freezes Used
            </h3>
            <p className="text-sm text-muted-foreground">{habit.streakFreezes.length} freeze{habit.streakFreezes.length !== 1 ? 's' : ''} used</p>
          </div>
        )}
      </div>
    </div>
  );
}
