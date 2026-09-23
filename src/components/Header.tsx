import React from 'react';
import { TabItem, ServerStatus, ReaderSettings } from '../types/otzaria';
import { BookOpen, Search, Bookmark, Settings, HardDrive, Plus, X, Sun, Moon, BookMarked } from 'lucide-react';

interface HeaderProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  serverStatus: ServerStatus | null;
  onOpenStorageModal: () => void;
  onOpenSettingsModal: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  serverStatus,
  onOpenStorageModal,
  onOpenSettingsModal,
  settings,
  onUpdateSettings
}) => {
  return (
    <header className="bg-amber-950 text-amber-50 border-b border-amber-900 shadow-md flex flex-col select-none">
      {/* Top Brand Bar & Global Actions */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-amber-900/60">
        <div className="flex items-center gap-3">
          <div className="bg-amber-800 text-amber-100 p-2 rounded-lg shadow-inner flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif tracking-wide text-amber-100 leading-tight">
              אוצרייה
            </h1>
            <p className="text-xs text-amber-300/80 font-sans">
              מאגר ספרים תורני מקוון בשרת
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Server Storage Sync Badge */}
          <button
            onClick={onOpenStorageModal}
            className="flex items-center gap-2 bg-amber-900/80 hover:bg-amber-800 text-amber-100 text-xs px-3 py-1.5 rounded-full border border-amber-700/50 transition-colors"
            title="מצב האחסון והורדת המאגר בשרת"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {serverStatus
                ? serverStatus.status === 'downloading'
                  ? `מוריד למאגר... ${serverStatus.progress}%`
                  : `מאגר בשרת: ${serverStatus.totalBooks} ספרים (${serverStatus.storageUsageMB} MB)`
                : 'טוען שרת...'}
            </span>
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={() =>
              onUpdateSettings({
                theme: settings.theme === 'dark' ? 'light' : 'dark'
              })
            }
            className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-200 transition-colors"
            title="החלף מצב תצוגה (יום/לילה)"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-amber-200" />
            )}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-200 transition-colors"
            title="הגדרות תצוגה וגופנים"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation Bar (כרטיסיות פתוחות) */}
      <div className="flex items-center gap-1 px-3 pt-1 bg-amber-950/90 overflow-x-auto scrollbar-none">
        {tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer border-t border-x transition-all duration-150 ${
                isActive
                  ? 'bg-amber-50 text-stone-900 border-amber-300 shadow-sm font-semibold'
                  : 'bg-amber-900/40 hover:bg-amber-900/80 text-amber-200 border-amber-900/50'
              }`}
            >
              {tab.type === 'library' && <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
              {tab.type === 'search' && <Search className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
              {tab.type === 'book' && <BookMarked className="w-3.5 h-3.5 text-amber-800 shrink-0" />}
              {tab.type === 'bookmarks' && <Bookmark className="w-3.5 h-3.5 text-amber-700 shrink-0" />}

              <span className="truncate max-w-[140px]">{tab.title}</span>

              {tabs.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className={`p-0.5 rounded-full hover:bg-amber-200/50 transition-colors ${
                    isActive ? 'text-stone-600 hover:text-stone-900' : 'text-amber-400 opacity-60 group-hover:opacity-100'
                  }`}
                  title="סגור כרטיסייה"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onNewTab}
          className="p-1.5 my-1 text-amber-300 hover:text-amber-100 hover:bg-amber-900 rounded-lg transition-colors"
          title="פתח כרטיסייה חדשה"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
