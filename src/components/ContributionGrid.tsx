import { useRef, useEffect } from 'react';
import { Habit, formatDate, isWeekCompleted } from '@/lib/storage';

interface ContributionGridProps {
  habit: Habit;
  days?: number;
  onToggle?: (date: string) => void;
  cellSize?: number;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ContributionGrid({ habit, days = 365, onToggle, cellSize = 11 }: ContributionGridProps) {
  const completions = new Set(habit.completionDates);
  const today = formatDate(new Date());
  const gap = 2;
  const scrollRef = useRef<HTMLDivElement>(null);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);

  // Align start to Monday
  const startDay = startDate.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  startDate.setDate(startDate.getDate() + mondayOffset);

  type Cell = { date: string; isCompleted: boolean; isToday: boolean; isFuture: boolean; isBeforeCreation: boolean };
  const weeks: Cell[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  const currentDate = new Date(startDate);
  let lastMonth = -1;

  while (currentDate <= endDate || currentDate.getDay() !== 1) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = formatDate(currentDate);
      const isBeforeCreation = date < habit.startDate;
      const isFuture = date > today;
      const isCompleted = isBeforeCreation || isFuture ? false : (habit.frequency === 'weekly'
        ? isWeekCompleted(habit, currentDate)
        : completions.has(date));

      if (d === 0 && currentDate.getMonth() !== lastMonth) {
        lastMonth = currentDate.getMonth();
        monthLabels.push({
          label: currentDate.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeks.length,
        });
      }

      week.push({ date, isCompleted, isToday: date === today, isFuture, isBeforeCreation });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    if (currentDate > endDate && currentDate.getDay() === 1) break;
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const colWidth = cellSize + gap;

  return (
    <div className="relative">
      <div className="flex">
        <div className="shrink-0 pr-1" style={{ width: 28 }}>
          <div style={{ height: 16 }} />
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[9px] text-muted-foreground flex items-center"
              style={{ height: cellSize + gap }}
            >
              {label}
            </div>
          ))}
        </div>
        <div ref={scrollRef} className="overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <div style={{ width: weeks.length * colWidth }}>
            {/* Month labels */}
            <div className="flex" style={{ height: 16 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find(m => m.weekIndex === wi);
                return (
                  <div key={wi} className="shrink-0 text-[9px] text-muted-foreground" style={{ width: colWidth }}>
                    {ml ? ml.label : ''}
                  </div>
                );
              })}
            </div>
            {/* Grid: 7 rows (Mon-Sun) x N week columns */}
            {Array.from({ length: 7 }, (_, rowIdx) => (
              <div key={rowIdx} className="flex" style={{ height: cellSize + gap }}>
                {weeks.map((week, wi) => {
                  const cell = week[rowIdx];
                  if (!cell) return <div key={wi} style={{ width: colWidth }} />;
                  return (
                    <div
                      key={cell.date}
                      onClick={(e) => {
                        if (onToggle && !cell.isFuture) {
                          e.stopPropagation();
                          onToggle(cell.date);
                        }
                      }}
                      className={`shrink-0 rounded-[2px] transition-all duration-150 ${
                        onToggle && !cell.isFuture ? 'cursor-pointer active:scale-110' : ''
                      } ${cell.isToday ? 'ring-1 ring-foreground/30' : ''}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        marginRight: gap,
                        backgroundColor: cell.isCompleted ? habit.color : 'hsl(var(--muted))',
                        opacity: cell.isBeforeCreation ? 0.1 : cell.isFuture ? 0.15 : cell.isCompleted ? 1 : 0.3,
                      }}
                      title={`${cell.date}${cell.isCompleted ? ' ✓' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
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
