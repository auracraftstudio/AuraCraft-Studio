import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ExternalLink, ShieldCheck, LogOut, Sparkles } from 'lucide-react';

interface AppInfo {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  icon: string;
  color: string;
  badge?: string;
}

const NEXUS_APPS: AppInfo[] = [
  {
    id: 'narrativ',
    name: 'Narrativ Forge',
    subtitle: 'Anime & Video Production Studio',
    url: 'http://localhost:3000',
    icon: '🎬',
    color: '#38bdf8',
  },
  {
    id: 'auracraft',
    name: 'AuraCraft Studio',
    subtitle: '3D Persona & VTuber Live Stage',
    url: 'http://localhost:5180',
    icon: '🎭',
    color: '#a855f7',
    badge: 'Current',
  },
  {
    id: 'doka',
    name: 'Doka AI DMS',
    subtitle: 'Document Management & OCR',
    url: 'http://localhost:5173',
    icon: '📑',
    color: '#10b981',
  },
  {
    id: 'logixa',
    name: 'Logixa Flow',
    subtitle: 'B2B Logistics & Fleet Operations',
    url: 'http://localhost:3002',
    icon: '🚚',
    color: '#f59e0b',
  },
  {
    id: 'cognix',
    name: 'Cognix Nexus',
    subtitle: 'Second Brain & Knowledge Graph',
    url: 'http://localhost:3001',
    icon: '🧠',
    color: '#ec4899',
  },
  {
    id: 'alittleworld',
    name: 'A Little World',
    subtitle: 'Couple Capsule & Travel Memories',
    url: 'http://localhost:3004',
    icon: '💖',
    color: '#f43f5e',
  },
];

interface NexusAppSwitcherProps {
  currentAppId?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
}

export const NexusAppSwitcher: React.FC<NexusAppSwitcherProps> = ({
  currentAppId = 'auracraft',
  userEmail = 'thuwon417@gmail.com',
  userName = 'Thuwon Admin',
  userRole = 'Super Admin',
  onSignOut,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 9-Dots Grid Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
          isOpen
            ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
            : 'bg-[#0f1628] hover:bg-[#152038] border-[#1a2540] hover:border-purple-500/40 text-slate-300 hover:text-white'
        }`}
        title="Nexus Suite App Switcher / App များ ကူးပြောင်းရန်"
      >
        <LayoutGrid className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold hidden sm:inline">Nexus Suite</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#0a0f1d]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#1a2540] px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">The Nexus Suite</span>
            </div>
            <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
              6 Apps Connected
            </span>
          </div>

          {/* User Account Info */}
          <div className="mb-2.5 p-2 bg-[#070b14] border border-[#1a2540] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate">{userName}</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400 flex-shrink-0" />
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out / အကောင့်ထွက်ရန်"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* App Grid List */}
          <div className="space-y-1">
            {NEXUS_APPS.map((app) => {
              const isCurrent = app.id === currentAppId;
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target={isCurrent ? '_self' : '_blank'}
                  rel="noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-purple-500/15 border border-purple-500/40 text-purple-200 shadow-sm'
                      : 'hover:bg-[#121a2d] border border-transparent hover:border-[#1e2d4d] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{app.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{app.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded font-mono font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{app.subtitle}</div>
                    </div>
                  </div>
                  {!isCurrent && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 hover:text-purple-400 flex-shrink-0 ml-2" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t border-[#1a2540] text-[10px] text-center text-slate-500">
            Unified Supabase Auth · Single Sign-On
          </div>
        </div>
      )}
    </div>
  );
};
