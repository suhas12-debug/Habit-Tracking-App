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
    const isBeforeCreation = date < habit.startDate;
    const isCompleted = isBeforeCreation ? false : (habit.frequency === 'weekly'
      ? isWeekCompleted(habit, d)
      : completions.has(date));
    const isToday = date === today;
    const isFuture = date > today;
    return { date, isCompleted, isToday, isFuture, isBeforeCreation };
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
            backgroundColor: cell.isCompleted
              ? habit.color
              : 'hsl(var(--muted))',
            opacity: cell.isBeforeCreation ? 0.15 : cell.isFuture ? 0.25 : cell.isCompleted ? 1 : 0.4,
          }}
          title={`${cell.date}${cell.isCompleted ? ' ✓' : ''}`}
        />
      ))}
    </div>
  );
}

// Compact grid for habit cards (current week: Mon-Sun, 7 boxes)
export function CompactGrid({ habit }: { habit: Habit }) {
  const completions = new Set(habit.completionDates);
  const today = formatDate(new Date());
  const now = new Date();
  
  // Get Monday of current week
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const cells = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = formatDate(d);
    const isBeforeCreation = date < habit.startDate;
    return {
      date,
      label: dayLabels[i],
      isCompleted: isBeforeCreation ? false : (habit.frequency === 'weekly'
        ? isWeekCompleted(habit, d)
        : completions.has(date)),
      isToday: date === today,
      isFuture: date > today,
      isBeforeCreation,
    };
  });

  return (
    <div className="flex gap-[4px]">
      {cells.map((cell) => (
        <div key={cell.date} className="flex flex-col items-center gap-0.5">
          <span className="text-[8px] text-muted-foreground leading-none">{cell.label}</span>
          <div
            className={`w-[14px] h-[14px] rounded-[3px] transition-all ${
              cell.isToday ? 'ring-1 ring-foreground/30' : ''
            }`}
            style={{
              backgroundColor: cell.isCompleted
                ? habit.color
                : 'hsl(var(--muted))',
              opacity: cell.isBeforeCreation ? 0.15 : cell.isFuture ? 0.2 : cell.isCompleted ? 1 : 0.3,
            }}
          />
        </div>
      ))}
    </div>
  );
}
