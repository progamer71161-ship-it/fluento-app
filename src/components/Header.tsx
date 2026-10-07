import React from 'react';
import { Sliders, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'scenarios' | 'drills' | 'history';
  onSelectTab: (tab: 'studio' | 'scenarios' | 'drills' | 'history') => void;
  onOpenManualEntry: () => void;
  onReplaySplash?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenManualEntry,
  onReplaySplash,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#E5E7EB] h-[72px] px-4 sm:px-8 flex items-center justify-between shadow-xs">
      {/* Logo */}
      <button
        onClick={() => {
          onSelectTab('studio');
        }}
        className="text-3xl sm:text-[2.2rem] text-[#58CC02] tracking-[-0.04em] leading-none hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2.5 group"
        title="Fluento - Go to Studio"
      >
        <img
          src="/logo.svg"
          alt="Fluento Owl Mascot Logo"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain border-2 border-[#1CB0F6]/40 shadow-[0_2px_0_#1899D6] group-hover:scale-105 transition-transform bg-white p-0.5"
        />
        <span className="font-gaegu font-bold text-[#58CC02] mt-0.5">Fluento</span>
      </button>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        <button
          onClick={() => onSelectTab('studio')}
          className={`font-extrabold text-[0.85rem] uppercase tracking-[0.05em] px-3.5 py-1.5 transition-colors cursor-pointer relative ${
            activeTab === 'studio'
              ? 'text-[#1CB0F6]'
              : 'text-[#AFC2D1] hover:text-[#1E293B]'
          }`}
        >
          <span>Studio Practice</span>
          {activeTab === 'studio' && (
            <span className="absolute bottom-[-14px] left-3.5 right-3.5 h-[3px] bg-[#1CB0F6] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('scenarios')}
          className={`font-extrabold text-[0.85rem] uppercase tracking-[0.05em] px-3.5 py-1.5 transition-colors cursor-pointer relative ${
            activeTab === 'scenarios'
              ? 'text-[#1CB0F6]'
              : 'text-[#AFC2D1] hover:text-[#1E293B]'
          }`}
        >
          <span>Scenarios</span>
          {activeTab === 'scenarios' && (
            <span className="absolute bottom-[-14px] left-3.5 right-3.5 h-[3px] bg-[#1CB0F6] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('drills')}
          className={`font-extrabold text-[0.85rem] uppercase tracking-[0.05em] px-3.5 py-1.5 transition-colors cursor-pointer relative ${
            activeTab === 'drills'
              ? 'text-[#1CB0F6]'
              : 'text-[#AFC2D1] hover:text-[#1E293B]'
          }`}
        >
          <span>Interactive Drills</span>
          {activeTab === 'drills' && (
            <span className="absolute bottom-[-14px] left-3.5 right-3.5 h-[3px] bg-[#1CB0F6] rounded-full" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`font-extrabold text-[0.85rem] uppercase tracking-[0.05em] px-3.5 py-1.5 transition-colors cursor-pointer relative ${
            activeTab === 'history'
              ? 'text-[#1CB0F6]'
              : 'text-[#AFC2D1] hover:text-[#1E293B]'
          }`}
        >
          <span>History & Growth</span>
          {activeTab === 'history' && (
            <span className="absolute bottom-[-14px] left-3.5 right-3.5 h-[3px] bg-[#1CB0F6] rounded-full" />
          )}
        </button>
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {onReplaySplash && (
          <button
            onClick={onReplaySplash}
            className="btn-secondary hidden lg:inline-flex items-center gap-1.5 text-slate-500! border-slate-200!"
            title="Replay intro splash screen"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#58CC02]" />
            <span>Intro</span>
          </button>
        )}

        <button
          onClick={onOpenManualEntry}
          className="btn-secondary hidden sm:inline-flex items-center gap-1.5"
          title="Custom benchmark metrics"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Metrics</span>
        </button>

        <button
          onClick={() => onSelectTab('studio')}
          className="btn-primary-blue flex items-center gap-1.5"
        >
          <span>Start Practice</span>
        </button>
      </div>
    </header>
  );
};
