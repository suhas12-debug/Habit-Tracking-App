import { useState } from 'react';
import { Moon, Sun, Download, Upload, RotateCcw, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { exportAllData, exportDataCSV, getHabits, importData, saveHabits } from '@/lib/storage';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [importing, setImporting] = useState(false);

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitgrid-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleExportCSV = () => {
    const csv = exportDataCSV(getHabits());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitgrid-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      if (importData(text)) {
        toast.success('Data imported successfully!');
        window.location.reload();
      } else {
        toast.error('Invalid file format');
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure? This will delete ALL your data.')) {
      localStorage.clear();
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  return (
    <div className="pb-24 px-5">
      <header className="py-5">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your app</p>
      </header>

      <div className="space-y-3">
        {/* Theme */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">{theme === 'dark' ? 'On' : 'Off'}</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-5 h-5 rounded-full bg-white mt-1 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">Export Data (JSON)</p>
            <p className="text-xs text-muted-foreground">Download all your habit data</p>
          </div>
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <FileText className="w-5 h-5 text-primary" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">Export CSV</p>
            <p className="text-xs text-muted-foreground">Spreadsheet-friendly format</p>
          </div>
        </button>

        {/* Import */}
        <button
          onClick={handleImport}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <Upload className="w-5 h-5 text-primary" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-foreground">Import Habits</p>
            <p className="text-xs text-muted-foreground">Restore from JSON backup</p>
          </div>
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <RotateCcw className="w-5 h-5 text-destructive" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-destructive">Reset All Data</p>
            <p className="text-xs text-muted-foreground">Delete everything and start fresh</p>
          </div>
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground">HabitGrid v1.0</p>
        <p className="text-xs text-muted-foreground mt-1">Built with ❤️</p>
      </div>
    </div>
  );
}
