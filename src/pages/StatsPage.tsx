import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getHabits, exportAllData, Habit, formatDate } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitkit-export-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Last 7 days completion data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = formatDate(date);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    let completed = 0;
    let total = 0;
    habits.forEach(h => {
      total += h.completionsPerDay;
      completed += Math.min(h.completions[dateStr] || 0, h.completionsPerDay);
    });
    return { day: dayLabel, completed, total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  // Per-habit stats
  const habitStats = habits.map(h => {
    const dates = Object.keys(h.completions);
    const totalCompletions = Object.values(h.completions).reduce((a, b) => a + b, 0);
    const completeDays = dates.filter(d => (h.completions[d] || 0) >= h.completionsPerDay).length;

    // Current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      if ((h.completions[ds] || 0) >= h.completionsPerDay) {
        streak++;
      } else if (i > 0) break;
    }

    return { ...h, totalCompletions, completeDays, streak };
  });

  // Category pie chart
  const categoryData = habits.reduce((acc, h) => {
    const cat = h.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  const pieColors = ['hsl(270,70%,55%)', 'hsl(350,80%,60%)', 'hsl(217,91%,60%)', 'hsl(142,70%,45%)', 'hsl(38,95%,55%)', 'hsl(180,70%,45%)'];

  return (
    <div className="pb-24 px-4">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-foreground">Statistics</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </header>

      {habits.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Add habits to see your stats</p>
      ) : (
        <div className="space-y-6">
          {/* Weekly completion */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Last 7 Days Completion</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7Days}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(240,5%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(240,5%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(240,5%,13%)', border: '1px solid hsl(240,4%,20%)', borderRadius: 8, color: '#fff' }}
                />
                <Bar dataKey="completed" fill="hsl(270,70%,55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Completion rate */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Daily Completion Rate (%)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7Days}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(240,5%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(240,5%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(240,5%,13%)', border: '1px solid hsl(240,4%,20%)', borderRadius: 8, color: '#fff' }}
                />
                <Bar dataKey="rate" fill="hsl(142,70%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Categories pie */}
          {pieData.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Habits by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'transparent', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Per habit stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Per Habit</h3>
            {habitStats.map(h => (
              <div key={h.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `hsl(${h.color} / 0.2)` }}
                  >
                    {h.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.category || 'No category'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: `hsl(${h.color})` }}>{h.streak}</p>
                    <p className="text-xs text-muted-foreground">Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{h.completeDays}</p>
                    <p className="text-xs text-muted-foreground">Days Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{h.totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
