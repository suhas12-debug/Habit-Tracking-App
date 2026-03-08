import { Habit, formatDate, isWeekCompleted } from '@/lib/storage';

interface ContributionGridProps {
  habit: Habit;
  days?: number;
  onToggle?: (date: string) => void;
  cellSize?: number;
}

export function ContributionGrid({ habit, days = 365, onToggle, cellSize = 12 }: ContributionGridProps) {
  const completions = new Set(habit.completionDates);
  const today = formatDate(new Date());
  const gap = 2;

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const date = formatDate(d);
    const isCompleted = completions.has(date);
    const isToday = date === today;
    const isFuture = date > today;
    return { date, isCompleted, isToday, isFuture };
  });

  return (
    <div
      className="flex flex-wrap"
      style={{ gap: `${gap}px` }}
    >
      {cells.map((cell) => (
        <div
          key={cell.date}
          onClick={(e) => {
            if (onToggle && !cell.isFuture) {
              e.stopPropagation();
              onToggle(cell.date);
            }
          }}
          className={`rounded-[3px] transition-all duration-150 ${
            onToggle && !cell.isFuture ? 'cursor-pointer active:scale-110' : ''
          } ${cell.isToday ? 'ring-1 ring-foreground/30' : ''}`}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: cell.isFuture
              ? 'transparent'
              : cell.isCompleted
              ? habit.color
              : 'hsl(var(--muted))',
            opacity: cell.isFuture ? 0.2 : cell.isCompleted ? 1 : 0.4,
          }}
          title={`${cell.date}${cell.isCompleted ? ' ✓' : ''}`}
        />
      ))}
    </div>
  );
}

// Compact grid for habit cards (current month only)
export function CompactGrid({ habit }: { habit: Habit }) {
  const completions = new Set(habit.completionDates);
  const today = formatDate(new Date());
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
    const date = formatDate(d);
    return {
      date,
      isCompleted: completions.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });

  return (
    <div className="flex flex-wrap gap-[2px]">
      {cells.map((cell) => (
        <div
          key={cell.date}
          className={`w-[10px] h-[10px] rounded-[2px] transition-all ${
            cell.isToday ? 'ring-1 ring-foreground/25' : ''
          }`}
          style={{
            backgroundColor: cell.isFuture
              ? 'transparent'
              : cell.isCompleted
              ? habit.color
              : 'hsl(var(--muted))',
            opacity: cell.isFuture ? 0.15 : cell.isCompleted ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}
