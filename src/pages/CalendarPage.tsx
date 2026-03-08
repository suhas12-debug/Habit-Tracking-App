import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Bell } from 'lucide-react';
import { CalendarNote, getNotes, saveNotes, generateId, formatDate, getDaysInMonth, getStartDayOfMonth } from '@/lib/storage';

export default function CalendarPage() {
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteReminder, setNoteReminder] = useState(false);
  const [editingNote, setEditingNote] = useState<CalendarNote | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);
  const today = formatDate(new Date());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  // Check for reminders on mount
  useEffect(() => {
    const todayNotes = notes.filter(n => n.date === today && n.reminder);
    if (todayNotes.length > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        todayNotes.forEach(n => {
          new Notification('📅 Reminder', { body: n.text });
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notes, today]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const getNotesForDate = (date: string) => notes.filter(n => n.date === date);

  const handleDayClick = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(date);
    setNoteText('');
    setNoteReminder(false);
    setEditingNote(null);
  };

  const saveNote = () => {
    if (!noteText.trim() || !selectedDate) return;
    let updated: CalendarNote[];
    if (editingNote) {
      updated = notes.map(n => n.id === editingNote.id ? { ...n, text: noteText.trim(), reminder: noteReminder } : n);
    } else {
      const newNote: CalendarNote = { id: generateId(), date: selectedDate, text: noteText.trim(), reminder: noteReminder };
      updated = [...notes, newNote];
    }
    setNotes(updated);
    saveNotes(updated);
    setNoteText('');
    setNoteReminder(false);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="pb-24 px-4">
      <header className="py-4">
        <h1 className="text-xl font-bold text-foreground">Calendar</h1>
      </header>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayNotes = getNotesForDate(date);
          const isToday = date === today;
          const isSelected = date === selectedDate;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                  ? 'bg-primary/20 text-foreground font-bold'
                  : 'text-foreground hover:bg-card'
              }`}
            >
              {day}
              {dayNotes.length > 0 && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="bg-card border border-border rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Existing notes */}
          {getNotesForDate(selectedDate).map(note => (
            <div key={note.id} className="bg-secondary rounded-lg p-3 mb-2 flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {note.reminder && <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                <p className="text-sm text-foreground">{note.text}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => { setEditingNote(note); setNoteText(note.text); setNoteReminder(note.reminder); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
                <button onClick={() => deleteNote(note.id)} className="text-xs text-destructive">
                  Del
                </button>
              </div>
            </div>
          ))}

          {/* Add/edit note */}
          <div className="mt-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note... (e.g. trip plan)"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteReminder}
                  onChange={(e) => setNoteReminder(e.target.checked)}
                  className="rounded"
                />
                <Bell className="w-3.5 h-3.5" />
                Remind me
              </label>
              <button
                onClick={saveNote}
                disabled={!noteText.trim()}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
              >
                {editingNote ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
