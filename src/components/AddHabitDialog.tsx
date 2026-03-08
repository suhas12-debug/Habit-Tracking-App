import { useState } from 'react';
import { X } from 'lucide-react';
import { Habit, HABIT_COLORS, HABIT_ICONS, generateId, formatDate } from '@/lib/storage';

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  editHabit?: Habit | null;
  onDelete?: (id: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AddHabitDialog({ open, onClose, onSave, editHabit, onDelete }: AddHabitDialogProps) {
  const [name, setName] = useState(editHabit?.name || '');
  const [icon, setIcon] = useState(editHabit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(editHabit?.color || HABIT_COLORS[0].value);
  const [frequency, setFrequency] = useState<Habit['frequency']>(editHabit?.frequency || 'daily');
  const [customDays, setCustomDays] = useState<number[]>(editHabit?.customDays || [0, 1, 2, 3, 4]);
  const [startDate, setStartDate] = useState(editHabit?.startDate || formatDate(new Date()));

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: editHabit?.id || generateId(),
      name: name.trim(),
      icon,
      color,
      startDate,
      frequency,
      customDays,
      completionDates: editHabit?.completionDates || [],
      streakFreezes: editHabit?.streakFreezes || [],
      notes: editHabit?.notes || {},
      archived: editHabit?.archived || false,
      order: editHabit?.order ?? Date.now(),
      createdAt: editHabit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-slide-up">
      <div className="min-h-full p-5 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-foreground">
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-primary font-semibold text-sm disabled:opacity-30"
          >
            Save
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2 mb-8">
          {HABIT_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
                icon === ic ? 'ring-2 ring-primary bg-accent' : 'opacity-50 hover:opacity-100'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        {/* Name */}
        <label className="block text-sm font-medium text-foreground mb-2">Habit Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground mb-6 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="e.g. Drink water, Read, Exercise"
        />

        {/* Color */}
        <label className="block text-sm font-medium text-foreground mb-3">Color</label>
        <div className="grid grid-cols-6 gap-3 mb-8">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`h-10 rounded-xl transition-all ${
                color === c.value ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : ''
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        {/* Frequency */}
        <label className="block text-sm font-medium text-foreground mb-3">Frequency</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['daily', 'weekly', 'custom'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFrequency(f)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                frequency === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {frequency === 'custom' && (
          <div className="flex gap-1.5 mb-6 animate-fade-in">
            {DAYS.map((label, idx) => (
              <button
                key={idx}
                onClick={() => toggleCustomDay(idx)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  customDays.includes(idx)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Start Date */}
        <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground mb-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        {/* Delete */}
        {editHabit && onDelete && (
          <button
            onClick={() => { onDelete(editHabit.id); onClose(); }}
            className="w-full bg-destructive/10 text-destructive rounded-xl py-3.5 font-medium mb-8"
          >
            Delete Habit
          </button>
        )}
      </div>
    </div>
  );
}
