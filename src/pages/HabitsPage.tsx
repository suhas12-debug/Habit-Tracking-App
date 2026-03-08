import { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Habit, getHabits, saveHabits, formatDate } from '@/lib/storage';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const save = (updated: Habit[]) => {
    setHabits(updated);
    saveHabits(updated);
  };

  const handleToggleToday = (id: string) => {
    const today = formatDate(new Date());
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const current = h.completions[today] || 0;
      const next = current >= h.completionsPerDay ? 0 : current + 1;
      return { ...h, completions: { ...h.completions, [today]: next } };
    });
    save(updated);
  };

  const handleSave = (habit: Habit) => {
    const exists = habits.find(h => h.id === habit.id);
    if (exists) {
      save(habits.map(h => h.id === habit.id ? habit : h));
    } else {
      save([...habits, habit]);
    }
    setEditHabit(null);
  };

  const handleDelete = (id: string) => {
    save(habits.filter(h => h.id !== id));
    setEditHabit(null);
  };

  return (
    <div className="pb-24">
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">
            Habit<span className="text-primary">Kit</span>
          </h1>
        </div>
        <button
          onClick={() => { setEditHabit(null); setShowAdd(true); }}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-card transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 space-y-3">
        {habits.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">No habits yet</p>
            <p className="text-muted-foreground/60 text-sm">Tap + to create your first habit</p>
          </div>
        )}
        {habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggleToday={handleToggleToday}
            onClick={(h) => { setEditHabit(h); setShowAdd(true); }}
          />
        ))}
      </div>

      <AddHabitDialog
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditHabit(null); }}
        onSave={handleSave}
        editHabit={editHabit}
        onDelete={handleDelete}
        key={editHabit?.id || 'new'}
      />
    </div>
  );
}
