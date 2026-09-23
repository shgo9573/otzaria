import React from 'react';
import { BookOpen, Search, Bookmark, HardDrive, Settings } from 'lucide-react';

interface SidebarProps {
  activeView: 'library' | 'search' | 'bookmarks' | 'storage' | 'settings';
  onSelectView: (view: 'library' | 'search' | 'bookmarks' | 'storage' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const menuItems = [
    { id: 'library', label: 'ספרייה', icon: BookOpen },
    { id: 'search', label: 'חיפוש במאגר', icon: Search },
    { id: 'bookmarks', label: 'סימניות', icon: Bookmark },
    { id: 'storage', label: 'אחסון בשרת', icon: HardDrive },
    { id: 'settings', label: 'הגדרות', icon: Settings }
  ] as const;

  return (
    <aside className="w-16 bg-amber-950/95 text-amber-100 border-l border-amber-900/60 flex flex-col items-center py-4 gap-4 shadow-inner shrink-0 select-none">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
              isActive
                ? 'bg-amber-800 text-amber-50 shadow-md ring-1 ring-amber-500/50'
                : 'text-amber-300/80 hover:bg-amber-900/80 hover:text-amber-100'
            }`}
            title={item.label}
          >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-200' : 'text-amber-400'}`} />
            <span className="text-[10px] font-medium leading-none tracking-tight">{item.label}</span>

            {/* Active Indicator Strip */}
            {isActive && (
              <span className="absolute right-0 top-2 bottom-2 w-1 bg-amber-400 rounded-l-full shadow" />
            )}
          </button>
        );
      })}
    </aside>
  );
};
