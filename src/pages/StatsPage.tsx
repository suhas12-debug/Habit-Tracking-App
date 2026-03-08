import { useState, useEffect } from 'react';
import { getHabits, Habit, formatDate, getCurrentStreak, getLongestStreak, getCompletionRate } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setHabits(getHabits().filter(h => !h.archived));
  }, []);

  const totalHabits = habits.length;
  const overallRate = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + getCompletionRate(h), 0) / habits.length)
    : 0;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getLongestStreak(h)), 0);
  const totalDays = habits.reduce((acc, h) => acc + h.completionDates.length, 0);

  // Weekly completion data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = formatDate(d);
    const completed = habits.filter(h => h.completionDates.includes(ds)).length;
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      total: habits.length,
    };
  });

  // Habit comparison
  const habitComparison = habits.map(h => ({
    name: `${h.icon} ${h.name.substring(0, 10)}`,
    streak: getCurrentStreak(h),
    color: h.color,
  })).sort((a, b) => b.streak - a.streak);

  return (
    <div className="pb-24 px-5">
      <header className="py-5">
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your habit analytics</p>
      </header>

      {habits.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-foreground font-semibold">No data yet</p>
          <p className="text-muted-foreground text-sm mt-1">Start tracking habits to see stats</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{totalHabits}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Habits</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-primary">{overallRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">🔥 {bestStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">Best Streak</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-foreground">{totalDays}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Completed</p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Weekly Completion</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    color: 'hsl(var(--foreground))',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Habit Comparison */}
          {habitComparison.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Habit Streaks</h3>
              <div className="space-y-3">
                {habitComparison.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm w-28 truncate text-foreground">{h.name}</span>
                    <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max(10, (h.streak / Math.max(bestStreak, 1)) * 100)}%`,
                          backgroundColor: h.color,
                        }}
                      >
                        <span className="text-xs font-bold text-white">{h.streak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
