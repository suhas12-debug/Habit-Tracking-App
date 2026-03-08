import { Check } from 'lucide-react';
import { Habit, formatDate, getCurrentStreak, getCompletionRate, isWeekCompleted } from '@/lib/storage';
import { CompactGrid } from './ContributionGrid';

interface HabitCardProps {
  habit: Habit;
  onToggleDate: (id: string, date: string) => void;
  onClick: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onToggleDate, onClick }: HabitCardProps) {
  const today = formatDate(new Date());
  const isComplete = habit.frequency === 'weekly'
    ? isWeekCompleted(habit, new Date())
    : habit.completionDates.includes(today);
  const streak = getCurrentStreak(habit);
  const rate = getCompletionRate(habit);

  return (
    <div
      className="bg-card rounded-xl p-4 border border-border animate-fade-in transition-all duration-200"
      onClick={() => onClick(habit)}
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
