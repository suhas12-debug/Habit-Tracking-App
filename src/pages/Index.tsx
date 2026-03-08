import { useState } from 'react';
import { LayoutGrid, Calendar, BarChart3 } from 'lucide-react';
import HabitsPage from './HabitsPage';
import CalendarPage from './CalendarPage';
import StatsPage from './StatsPage';

const tabs = [
  { id: 'habits', label: 'Habits', icon: LayoutGrid },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
] as const;

type Tab = typeof tabs[number]['id'];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {activeTab === 'habits' && <HabitsPage />}
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'stats' && <StatsPage />}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto px-6 pb-6 pt-2">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-full px-2 py-2 flex items-center justify-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isActive && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
