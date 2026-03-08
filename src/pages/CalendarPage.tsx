import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, FileText, Trash2, X } from 'lucide-react';
import {
  CalendarNote, CalendarReminder,
  getCalendarNotes, saveCalendarNotes,
  getCalendarReminders, saveCalendarReminders,
  getHabits, formatDate, generateId,
} from '@/lib/storage';
import { scheduleCalendarReminder } from '@/lib/notifications';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [reminders, setReminders] = useState<CalendarReminder[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');

  const habits = getHabits();
  const today = formatDate(new Date());

  useEffect(() => {
    setNotes(getCalendarNotes());
    setReminders(getCalendarReminders());
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (() => {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Mon=0
  })();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dateNotes = notes.filter(n => n.date === selectedDate);
  const dateReminders = reminders.filter(r => r.date === selectedDate);

  // Check which dates have notes/reminders/completions
  const completionDates = new Set(habits.flatMap(h => h.completionDates));
  const noteDates = new Set(notes.map(n => n.date));
  const reminderDates = new Set(reminders.map(r => r.date));

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    const newNote: CalendarNote = {
      id: generateId(),
      date: selectedDate,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    saveCalendarNotes(updated);
    setNoteText('');
    setShowAddNote(false);
  }, [noteText, selectedDate, notes]);

  const handleDeleteNote = useCallback((id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveCalendarNotes(updated);
  }, [notes]);

  const handleAddReminder = useCallback(() => {
    if (!reminderTitle.trim()) return;
    const newReminder: CalendarReminder = {
      id: generateId(),
      date: selectedDate,
      time: reminderTime,
      title: reminderTitle.trim(),
      notified: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveCalendarReminders(updated);
    scheduleCalendarReminder(newReminder);
    setReminderTitle('');
    setReminderTime('09:00');
    setShowAddReminder(false);
  }, [reminderTitle, reminderTime, selectedDate, reminders]);

  const handleDeleteReminder = useCallback((id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    saveCalendarReminders(updated);
  }, [reminders]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="pb-24">
      <header className="px-5 py-5">
        <h1 className="text-2xl font-bold text-foreground">
          Calendar
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Notes & reminders</p>
      </header>

      {/* Month navigation */}
      <div className="px-5 flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="font-semibold text-foreground">{monthLabel}</span>
        <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="px-5 grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-5 grid grid-cols-7 gap-1 mb-6">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = formatDate(new Date(year, month, day));
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasCompletion = completionDates.has(dateStr);
          const hasNote = noteDates.has(dateStr);
          const hasReminder = reminderDates.has(dateStr);
          const isFuture = dateStr > today;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-90 relative ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                  : isFuture
                  ? 'text-muted-foreground/50'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {day}
              {/* Dot indicators */}
              <div className="flex gap-[2px] mt-0.5">
                {hasCompletion && (
                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />
                )}
                {hasNote && (
                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/70' : 'bg-blue-400'}`} />
                )}
                {hasReminder && (
                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/70' : 'bg-amber-400'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground text-sm">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddReminder(true); setShowAddNote(false); }}
              className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowAddNote(true); setShowAddReminder(false); }}
              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add note form */}
        {showAddNote && (
          <div className="bg-card border border-border rounded-xl p-4 mb-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Add Note</span>
              <button onClick={() => setShowAddNote(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your note..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
            />
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              Save Note
            </button>
          </div>
        )}

        {/* Add reminder form */}
        {showAddReminder && (
          <div className="bg-card border border-border rounded-xl p-4 mb-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Add Reminder</span>
              <button onClick={() => setShowAddReminder(false)} className="text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={reminderTitle}
              onChange={e => setReminderTitle(e.target.value)}
              placeholder="Reminder title..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
            />
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2"
            />
            <button
              onClick={handleAddReminder}
              disabled={!reminderTitle.trim()}
              className="w-full bg-amber-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              Set Reminder
            </button>
          </div>
        )}

        {/* Notes list */}
        {dateNotes.length > 0 && (
          <div className="space-y-2 mb-3">
            {dateNotes.map(note => (
              <div key={note.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
                <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground flex-1">{note.text}</p>
                <button onClick={() => handleDeleteNote(note.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Reminders list */}
        {dateReminders.length > 0 && (
          <div className="space-y-2 mb-3">
            {dateReminders.map(rem => (
              <div key={rem.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{rem.title}</p>
                  <p className="text-xs text-muted-foreground">{rem.time}</p>
                </div>
                <button onClick={() => handleDeleteReminder(rem.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Habit completions for this date */}
        {habits.some(h => h.completionDates.includes(selectedDate)) && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Completed Habits</p>
            <div className="flex flex-wrap gap-2">
              {habits.filter(h => h.completionDates.includes(selectedDate)).map(h => (
                <div
                  key={h.id}
                  className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1.5"
                >
                  <span className="text-sm">{h.icon}</span>
                  <span className="text-xs font-medium text-foreground">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dateNotes.length === 0 && dateReminders.length === 0 && !habits.some(h => h.completionDates.includes(selectedDate)) && (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">No notes or reminders</p>
            <p className="text-muted-foreground text-xs mt-1">Tap + to add a note or 🔔 for a reminder</p>
          </div>
        )}
      </div>
    </div>
  );
}
