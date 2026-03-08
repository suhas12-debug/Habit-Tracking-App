import { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Habit, HABIT_COLORS, HABIT_ICONS, CATEGORIES, generateId, Reminder } from '@/lib/storage';

interface AddHabitDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  editHabit?: Habit | null;
  onDelete?: (id: string) => void;
}

export function AddHabitDialog({ open, onClose, onSave, editHabit, onDelete }: AddHabitDialogProps) {
  const [name, setName] = useState(editHabit?.name || '');
  const [description, setDescription] = useState(editHabit?.description || '');
  const [color, setColor] = useState(editHabit?.color || HABIT_COLORS[0].hsl);
  const [icon, setIcon] = useState(editHabit?.icon || HABIT_ICONS[0]);
  const [streakGoal, setStreakGoal] = useState<Habit['streakGoal']>(editHabit?.streakGoal || 'none');
  const [category, setCategory] = useState(editHabit?.category || '');
  const [completionsPerDay, setCompletionsPerDay] = useState(editHabit?.completionsPerDay || 1);
  const [weeklyGoal, setWeeklyGoal] = useState(editHabit?.weeklyGoal || 0);
  const [reminders, setReminders] = useState<Reminder[]>(editHabit?.reminders || []);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: editHabit?.id || generateId(),
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      streakGoal,
      category,
      completionsPerDay,
      weeklyGoal,
      reminders,
      completions: editHabit?.completions || {},
      createdAt: editHabit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  const addReminder = () => {
    setReminders([...reminders, { id: generateId(), days: [0, 1, 2, 3, 4], time: '10:00' }]);
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminderDay = (reminderId: string, day: number) => {
    setReminders(reminders.map(r => {
      if (r.id !== reminderId) return r;
      const days = r.days.includes(day) ? r.days.filter(d => d !== day) : [...r.days, day];
      return { ...r, days };
    }));
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 overflow-y-auto">
      <div className="min-h-full p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-foreground">
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <div className="w-6" />
        </div>

        {/* Icon picker */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2 mb-6">
          {HABIT_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                icon === ic ? 'bg-primary/20 ring-1 ring-primary' : 'opacity-50 hover:opacity-100'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>

        {/* Name */}
        <label className="block text-sm text-muted-foreground mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground mb-4 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Habit name"
        />

        {/* Description */}
        <label className="block text-sm text-muted-foreground mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground mb-4 resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Optional description"
        />

        {/* Color */}
        <label className="block text-sm text-muted-foreground mb-2">Color</label>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {HABIT_COLORS.map((c) => (
            <button
              key={c.hsl}
              onClick={() => setColor(c.hsl)}
              className={`w-10 h-10 rounded-lg transition-all ${
                color === c.hsl ? 'ring-2 ring-foreground scale-110' : ''
              }`}
              style={{ backgroundColor: `hsl(${c.hsl})` }}
            />
          ))}
        </div>

        {/* Advanced Options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-center text-sm text-muted-foreground border-t border-border pt-3 mb-4"
        >
          Advanced Options {showAdvanced ? '▲' : '▼'}
        </button>

        {showAdvanced && (
          <div className="space-y-4 animate-fade-in">
            {/* Streak Goal */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Streak Goal</label>
              <div className="grid grid-cols-4 gap-2">
                {(['none', 'daily', 'weekly', 'monthly'] as const).map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setStreakGoal(goal)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      streakGoal === goal
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground'
                    }`}
                  >
                    {goal.charAt(0).toUpperCase() + goal.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(category === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Completions per day */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Completions Per Day</label>
              <div className="flex items-center gap-3">
                <div className="bg-card border border-border rounded-lg px-4 py-2 flex-1 text-foreground">
                  {completionsPerDay} / Day
                </div>
                <button
                  onClick={() => setCompletionsPerDay(Math.max(1, completionsPerDay - 1))}
                  className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-foreground"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCompletionsPerDay(completionsPerDay + 1)}
                  className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-primary mt-1">
                The square will be filled completely when this number is met
              </p>
            </div>

            {/* Weekly Goal */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Weekly Goal</label>
              <div className="flex items-center gap-3">
                <div className="bg-card border border-border rounded-lg px-4 py-2 flex-1 text-foreground">
                  {weeklyGoal === 0 ? 'No goal' : `${weeklyGoal} / Week`}
                </div>
                <button
                  onClick={() => setWeeklyGoal(Math.max(0, weeklyGoal - 1))}
                  className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-foreground"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWeeklyGoal(weeklyGoal + 1)}
                  className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-foreground"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-primary mt-1">
                Set a target for how many days per week to complete this habit
              </p>
            </div>

            {/* Reminders */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Reminders</label>
              {reminders.map((reminder) => (
                <div key={reminder.id} className="bg-card border border-border rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Reminder</span>
                    <button onClick={() => removeReminder(reminder.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {dayLabels.map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleReminderDay(reminder.id, idx)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          reminder.days.includes(idx)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="time"
                    value={reminder.time}
                    onChange={(e) =>
                      setReminders(reminders.map(r => r.id === reminder.id ? { ...r, time: e.target.value } : r))
                    }
                    className="bg-secondary border border-border rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
              <button
                onClick={addReminder}
                className="w-full bg-card border border-border rounded-lg py-3 text-foreground font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Reminder
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3 pb-8">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3.5 font-semibold text-base"
          >
            Save
          </button>
          {editHabit && onDelete && (
            <button
              onClick={() => { onDelete(editHabit.id); onClose(); }}
              className="w-full bg-destructive/10 text-destructive rounded-lg py-3 font-medium"
            >
              Delete Habit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
