import { useState } from 'react';
import { LayoutGrid, BarChart3, Plus, Settings } from 'lucide-react';
import { isOnboardingDone } from '@/lib/storage';
import { Onboarding } from '@/components/Onboarding';
import HabitsPage from './HabitsPage';
import StatsPage from './StatsPage';
import SettingsPage from './SettingsPage';

const tabs = [
  { id: 'habits', label: 'Habits', icon: LayoutGrid },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

type Tab = typeof tabs[number]['id'];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone());

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  const handleTabClick = (tabId: Tab) => {
    if (tabId === 'add') {
      // Dispatch custom event to trigger add dialog in HabitsPage
      window.dispatchEvent(new CustomEvent('habitgrid:add'));
      setActiveTab('habits');
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {activeTab === 'habits' && <HabitsPage />}
      {activeTab === 'stats' && <StatsPage />}
      {activeTab === 'settings' && <SettingsPage />}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto bg-card/90 backdrop-blur-xl border-t border-border safe-bottom">
          <div className="flex items-center justify-around py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAdd = tab.id === 'add';

              if (isAdd) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center -mt-4 shadow-lg active:scale-90 transition-transform"
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
