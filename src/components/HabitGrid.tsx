import { Habit, formatDate } from '@/lib/storage';

interface HabitGridProps {
  habit: Habit;
  month: number;
  year: number;
  compact?: boolean;
}

export function HabitGrid({ habit, month, year, compact = false }: HabitGridProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = formatDate(new Date());
  const cols = compact ? 7 : 7;
  const size = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    const count = habit.completions[date] || 0;
    const ratio = Math.min(count / Math.max(habit.completionsPerDay, 1), 1);
    return { date, count, ratio, isToday: date === today };
  });

  return (
    <div className="flex flex-wrap gap-[3px]">
      {days.map((day) => (
        <div
          key={day.date}
          className={`${size} rounded-[2px] transition-all ${day.isToday ? 'ring-1 ring-foreground/30' : ''}`}
          style={{
            backgroundColor: `hsl(${habit.color} / ${day.ratio > 0 ? 0.2 + day.ratio * 0.8 : 0.08})`,
          }}
          title={`${day.date}: ${day.count}/${habit.completionsPerDay}`}
        />
      ))}
    </div>
  );
}
