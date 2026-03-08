import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Habit, getHabits, saveHabits, formatDate } from '@/lib/storage';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { HabitDetail } from '@/components/HabitDetail';
import { toast } from 'sonner';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);

  // Drag reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const dragStartY = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  useEffect(() => {
    const handler = () => { setEditHabit(null); setShowAdd(true); };
    window.addEventListener('habitgrid:add', handler);
    return () => window.removeEventListener('habitgrid:add', handler);
  }, []);

  const save = (updated: Habit[]) => {
    setHabits(updated);
    saveHabits(updated);
  };

  const handleToggleDate = (id: string, date: string) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const has = h.completionDates.includes(date);
      return {
        ...h,
        completionDates: has
          ? h.completionDates.filter(d => d !== date)
          : [...h.completionDates, date],
      };
    });
    save(updated);
    if (detailHabit) {
      setDetailHabit(updated.find(h => h.id === detailHabit.id) || null);
    }
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
    setDetailHabit(null);
  };

  const handleStreakFreeze = (id: string) => {
    const today = formatDate(new Date());
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      if (h.streakFreezes.includes(today)) {
        toast.info('Streak freeze already used today');
        return h;
      }
      toast.success('Streak freeze applied! 🧊');
      return { ...h, streakFreezes: [...h.streakFreezes, today] };
    });
    save(updated);
    if (detailHabit) {
      setDetailHabit(updated.find(h => h.id === detailHabit.id) || null);
    }
  };

  const handleRemoveFreeze = (id: string, date: string) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      return { ...h, streakFreezes: h.streakFreezes.filter(d => d !== date) };
    });
    save(updated);
    if (detailHabit) {
      setDetailHabit(updated.find(h => h.id === detailHabit.id) || null);
    }
    toast.info('Streak freeze removed');
  };

  // Reorder logic
  const activeHabits = habits
    .filter(h => !h.archived)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleReorderStart = useCallback((index: number, clientY: number) => {
    setDragIndex(index);
    setDragOverIndex(index);
    setIsReordering(true);
    dragStartY.current = clientY;
    dragCurrentY.current = clientY;
    if (navigator.vibrate) navigator.vibrate(30);
  }, []);

  const handleReorderMove = useCallback((clientY: number) => {
    if (dragIndex === null) return;
    dragCurrentY.current = clientY;
    // Calculate which index we're hovering over based on card height (~90px)
    const cardHeight = 90;
    const delta = clientY - dragStartY.current;
    const indexDelta = Math.round(delta / cardHeight);
    const newIndex = Math.max(0, Math.min(activeHabits.length - 1, dragIndex + indexDelta));
    setDragOverIndex(newIndex);
  }, [dragIndex, activeHabits.length]);

  const handleReorderEnd = useCallback(() => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const reordered = [...activeHabits];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dragOverIndex, 0, moved);
      // Update order values
      const updatedHabits = habits.map(h => {
        const newIdx = reordered.findIndex(r => r.id === h.id);
        if (newIdx >= 0) return { ...h, order: newIdx };
        return h;
      });
      save(updatedHabits);
      toast.success('Habits reordered');
    }
    setDragIndex(null);
    setDragOverIndex(null);
    setIsReordering(false);
  }, [dragIndex, dragOverIndex, activeHabits, habits]);

  // Touch handlers for reorder
  const handleCardTouchStart = (index: number, e: React.TouchEvent) => {
    const clientY = e.touches[0].clientY;
    longPressTimer.current = window.setTimeout(() => {
      handleReorderStart(index, clientY);
    }, 500);
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer.current && !isReordering) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isReordering) {
      e.preventDefault();
      handleReorderMove(e.touches[0].clientY);
    }
  };

  const handleCardTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isReordering) {
      handleReorderEnd();
    }
  };

  return (
    <div className="pb-24">
      <header className="flex items-center justify-between px-5 py-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Habit<span className="text-primary">Grid</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeHabits.length} habit{activeHabits.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={() => { setEditHabit(null); setShowAdd(true); }}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="px-5 space-y-3">
        {activeHabits.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-foreground font-semibold text-lg mb-1">No habits yet</p>
            <p className="text-muted-foreground text-sm">Tap + to create your first habit</p>
          </div>
        )}

        {isReordering && (
          <div className="text-center text-xs text-primary font-medium animate-pulse mb-2">
            ↕ Drag to reorder • Release to save
          </div>
        )}

        {activeHabits.map((habit, index) => (
          <div
            key={habit.id}
            className={`transition-all duration-200 ${
              isReordering && dragIndex === index
                ? 'opacity-50 scale-95'
                : ''
            } ${
              isReordering && dragOverIndex === index && dragIndex !== index
                ? 'border-t-2 border-primary pt-1'
                : ''
            }`}
            onTouchStart={(e) => handleCardTouchStart(index, e)}
            onTouchMove={(e) => handleCardTouchMove(e)}
            onTouchEnd={handleCardTouchEnd}
          >
            <HabitCard
              habit={habit}
              onToggleDate={handleToggleDate}
              onClick={(h) => !isReordering && setDetailHabit(h)}
              onEdit={(h) => { setEditHabit(h); setShowAdd(true); }}
            />
          </div>
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

      {detailHabit && (
        <HabitDetail
          habit={detailHabit}
          onClose={() => setDetailHabit(null)}
          onEdit={(h) => { setEditHabit(h); setShowAdd(true); setDetailHabit(null); }}
          onDelete={handleDelete}
          onToggleDate={handleToggleDate}
          onStreakFreeze={handleStreakFreeze}
          onRemoveFreeze={handleRemoveFreeze}
        />
      )}
    </div>
  );
}
