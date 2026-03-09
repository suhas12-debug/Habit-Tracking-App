import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'habitgrid_quicknotes';

function getQuickNotes(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function saveQuickNotes(text: string) {
  localStorage.setItem(STORAGE_KEY, text);
}

interface QuickNotesProps {
  open: boolean;
  onClose: () => void;
}

export function QuickNotes({ open, onClose }: QuickNotesProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (open) setText(getQuickNotes());
  }, [open]);

  const handleChange = (val: string) => {
    setText(val);
    saveQuickNotes(val);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-white font-semibold text-lg">Quick Notes</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write something..."
        autoFocus
        className="flex-1 bg-transparent text-white px-5 py-2 text-sm leading-relaxed resize-none outline-none placeholder:text-white/30"
      />
    </div>
  );
}
