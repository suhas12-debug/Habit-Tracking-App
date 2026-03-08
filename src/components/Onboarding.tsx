import { useState } from 'react';
import { setOnboardingDone } from '@/lib/storage';

const screens = [
  { emoji: '🌟', title: 'Build better habits\nevery day.', subtitle: 'Small consistent actions lead to big results.' },
  { emoji: '🔥', title: 'Track streaks and\nstay consistent.', subtitle: 'Never break the chain. Visualize your progress.' },
  { emoji: '📊', title: 'Visualize your\nprogress.', subtitle: 'GitHub-style grids show your journey at a glance.' },
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current === screens.length - 1) {
      setOnboardingDone();
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  const screen = screens[current];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm animate-fade-in" key={current}>
        <div className="text-7xl mb-8">{screen.emoji}</div>
        <h1 className="text-2xl font-bold text-foreground text-center whitespace-pre-line leading-tight mb-4">
          {screen.title}
        </h1>
        <p className="text-muted-foreground text-center text-sm">{screen.subtitle}</p>
      </div>

      <div className="pb-12 w-full max-w-sm">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-semibold text-base active:scale-[0.98] transition-transform"
        >
          {current === screens.length - 1 ? 'Get Started' : 'Continue'}
        </button>

        {current < screens.length - 1 && (
          <button
            onClick={() => { setOnboardingDone(); onComplete(); }}
            className="w-full text-muted-foreground text-sm mt-3 py-2"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
