import { Check } from 'lucide-react';
import { Habit, formatDate } from '@/lib/storage';
import { HabitGrid } from './HabitGrid';

interface HabitCardProps {
  habit: Habit;
  onToggleToday: (id: string) => void;
  onClick: (habit: Habit) => void;
}

export function HabitCard({ habit, onToggleToday, onClick }: HabitCardProps) {
  const today = formatDate(new Date());
  const todayCount = habit.completions[today] || 0;
  const isComplete = todayCount >= habit.completionsPerDay;
  const now = new Date();

  return (
    <div
      className="bg-card rounded-lg p-4 border border-border cursor-pointer animate-fade-in hover:border-muted-foreground/30 transition-colors"
      onClick={() => onClick(habit)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `hsl(${habit.color} / 0.2)` }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{habit.name}</h3>
            {habit.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{habit.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleToday(habit.id);
          }}
          className="w-12 h-12 rounded-lg flex items-center justify-center transition-all"
          style={{
            backgroundColor: isComplete
              ? `hsl(${habit.color})`
              : `hsl(${habit.color} / 0.15)`,
          }}
        >
          <Check
            className="w-6 h-6 transition-colors"
            style={{ color: isComplete ? 'white' : `hsl(${habit.color} / 0.4)` }}
          />
        </button>
      </div>
      <HabitGrid habit={habit} month={now.getMonth()} year={now.getFullYear()} />
    </div>
  );
}
