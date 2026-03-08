import { useRef, useEffect, useState, useCallback } from 'react';
import { Habit, formatDate, isWeekCompleted } from '@/lib/storage';

interface ContributionGridProps {
  habit: Habit;
  onToggle?: (date: string) => void;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ContributionGrid({ habit, onToggle }: ContributionGridProps) {
  const completions = new Set(habit.completionDates);
  const today = formatDate(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearEnd = new Date(currentYear, 11, 31);
  const startDate = new Date(currentYear, 0, 1);

  // Align start to Monday
  const startDay = startDate.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  startDate.setDate(startDate.getDate() + mondayOffset);

  type Cell = { date: string; isCompleted: boolean; isToday: boolean; isFuture: boolean; isBeforeCreation: boolean };
  const weeks: Cell[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];
  const currentDate = new Date(startDate);
  let lastMonth = -1;

  while (currentDate <= yearEnd) {
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
  }

  const cellSize = 14;
  const gap = 3;
  const colWidth = cellSize + gap;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll to show current month area
    const todayWeekIdx = weeks.findIndex(w => w.some(c => c.isToday));
    if (todayWeekIdx >= 0) {
      const targetScroll = Math.max(0, (todayWeekIdx - 3) * colWidth);
      el.scrollLeft = targetScroll;
    }
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scroll arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm backdrop-blur-sm"
        >
          ‹
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm backdrop-blur-sm"
        >
          ›
        </button>
      )}

      <div className="flex">
        {/* Day labels */}
        <div className="shrink-0 pr-2" style={{ width: 36 }}>
          <div style={{ height: 20 }} />
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground flex items-center"
              style={{ height: cellSize + gap }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Scrollable grid */}
        <div
          ref={scrollRef}
          className="overflow-x-auto flex-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <div style={{ width: weeks.length * colWidth }}>
            {/* Month labels */}
            <div className="flex" style={{ height: 20 }}>
              {weeks.map((_, wi) => {
                const ml = monthLabels.find(m => m.weekIndex === wi);
                return (
                  <div key={wi} className="shrink-0 text-[10px] font-medium text-muted-foreground" style={{ width: colWidth }}>
                    {ml ? ml.label : ''}
                  </div>
                );
              })}
            </div>
            {/* Grid rows */}
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
                      className={`shrink-0 rounded-[3px] transition-all duration-150 ${
                        onToggle && !cell.isFuture ? 'cursor-pointer active:scale-125' : ''
                      } ${cell.isToday ? 'ring-[1.5px] ring-primary ring-offset-1 ring-offset-background' : ''}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        marginRight: gap,
                        backgroundColor: cell.isBeforeCreation
                          ? 'hsl(var(--muted))'
                          : cell.isFuture
                          ? 'hsl(var(--muted))'
                          : cell.isCompleted
                          ? habit.color
                          : 'hsl(0 60% 50%)',
                        opacity: cell.isBeforeCreation ? 0.2 : cell.isFuture ? 0.2 : cell.isCompleted ? 1 : 0.35,
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
