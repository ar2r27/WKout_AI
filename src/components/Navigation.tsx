import React from 'react';
import { Zap, Calendar, Bot, History, User, Settings, Sparkles } from 'lucide-react';

export type TabType = 'workout' | 'plan' | 'coach' | 'history' | 'profile' | 'backup';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeWorkoutRunning: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeWorkoutRunning
}) => {
  const tabs = [
    {
      id: 'workout' as TabType,
      label: 'Trening',
      icon: Zap,
      hasPulse: activeWorkoutRunning,
      highlight: true
    },
    {
      id: 'plan' as TabType,
      label: 'Mój Plan',
      icon: Calendar
    },
    {
      id: 'coach' as TabType,
      label: 'Trener AI',
      icon: Bot,
      badge: 'Gemini'
    },
    {
      id: 'history' as TabType,
      label: 'Historia',
      icon: History
    },
    {
      id: 'profile' as TabType,
      label: 'Profil',
      icon: User
    },
    {
      id: 'backup' as TabType,
      label: 'Dysk / Kopia',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Desktop Navigation (Sub-header) */}
      <div className="hidden md:block w-full bg-zinc-900/60 border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center space-x-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400'
                    } ${tab.hasPulse ? 'animate-bounce text-emerald-400' : ''}`}
                  />
                  <span>{tab.label}</span>
                  {tab.hasPulse && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold border border-emerald-500/30">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (iOS / Android Native Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 pb-safe">
        <div className="grid grid-cols-6 items-center px-1 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl relative transition-all ${
                  isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-emerald-400 scale-110' : 'text-zinc-400'
                    } transition-transform ${tab.hasPulse ? 'text-emerald-400 animate-pulse' : ''}`}
                  />
                  {tab.hasPulse && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                  {tab.badge && !tab.hasPulse && (
                    <span className="absolute -top-1.5 -right-2 text-[8px] bg-emerald-500 text-black px-1 rounded-full font-bold">
                      AI
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium truncate max-w-[54px] ${isActive ? 'font-bold text-white' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
