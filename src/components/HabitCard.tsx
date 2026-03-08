import { Check } from 'lucide-react';
import { Habit, formatDate, getCurrentStreak, getCompletionRate, isWeekCompleted } from '@/lib/storage';
import { CompactGrid } from './ContributionGrid';
import { useState, useRef } from 'react';

interface HabitCardProps {
  habit: Habit;
  onToggleDate: (id: string, date: string) => void;
  onClick: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onToggleDate, onClick, onEdit }: HabitCardProps) {
  const today = formatDate(new Date());
  const isComplete = habit.frequency === 'weekly'
    ? isWeekCompleted(habit, new Date())
    : habit.completionDates.includes(today);
  const streak = getCurrentStreak(habit);
  const rate = getCompletionRate(habit);
  const longPressTimer = useRef<number | null>(null);
  const [pressing, setPressing] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPressing(true);
    longPressTimer.current = window.setTimeout(() => {
      onEdit(habit);
      setPressing(false);
    }, 600);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 50) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (dx > 50) setSwiped('right');
      if (dx < -50) setSwiped('left');
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setPressing(false);
    if (swiped === 'right') {
      onToggleDate(habit.id, today);
    }
    setSwiped(null);
    touchStart.current = null;
  };

  return (
    <div
      className={`bg-card rounded-xl p-4 border border-border animate-fade-in transition-all duration-200 ${
        pressing ? 'scale-[0.98]' : ''
      } ${swiped === 'right' ? 'translate-x-4 opacity-80' : ''} ${swiped === 'left' ? '-translate-x-4 opacity-80' : ''}`}
      onClick={() => onClick(habit)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-[15px]">{habit.name}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground">🔥 {streak} day{streak !== 1 ? 's' : ''}</span>
              <span className="text-xs text-muted-foreground">{rate}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDate(habit.id, today);
          }}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            isComplete ? 'animate-check-pop' : ''
          }`}
          style={{
            backgroundColor: isComplete ? habit.color : `${habit.color}20`,
          }}
        >
          <Check
            className="w-5 h-5 transition-colors"
            style={{ color: isComplete ? 'white' : `${habit.color}60` }}
          />
        </button>
      </div>
      <CompactGrid habit={habit} />
    </div>
  );
}
