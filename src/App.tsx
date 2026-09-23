import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LibraryView } from './components/LibraryView';
import { BookReader } from './components/BookReader';
import { SearchView } from './components/SearchView';
import { BookmarksView } from './components/BookmarksView';
import { ServerStorageModal } from './components/ServerStorageModal';
import { SettingsModal } from './components/SettingsModal';
import { getLibraryTree, getServerStatus, triggerLibraryDownload } from './services/api';
import { TabItem, CatalogData, ServerStatus, BookmarkItem, ReaderSettings } from './types/otzaria';

export const App: React.FC = () => {
  // Tabs management
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab-library', type: 'library', title: 'ספרייה' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-library');
  const [activeView, setActiveView] = useState<'library' | 'search' | 'bookmarks' | 'storage' | 'settings'>('library');

  // Server & Catalog data
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Modals
  const [isStorageModalOpen, setIsStorageModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const saved = localStorage.getItem('otzaria_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reader Settings
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('otzaria_settings');
      return saved
        ? JSON.parse(saved)
        : {
            fontFamily: 'Frank Ruhl Hofshi',
            fontSize: 20,
            lineHeight: 1.6,
            showNikud: true,
            theme: 'light'
          };
    } catch {
      return {
        fontFamily: 'Frank Ruhl Hofshi',
        fontSize: 20,
        lineHeight: 1.6,
        showNikud: true,
        theme: 'light'
      };
    }
  });

  // Fetch initial catalog and server status
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingCatalog(true);
      try {
        const [catData, statusData] = await Promise.all([
          getLibraryTree(),
          getServerStatus()
        ]);
        setCatalog(catData);
        setServerStatus(statusData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoadingCatalog(false);
      }
    };

    fetchData();

    // Poll server status periodically
    const interval = setInterval(async () => {
      try {
        const status = await getServerStatus();
        setServerStatus(status);
      } catch (err) {
        console.error('Status poll error', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('otzaria_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('otzaria_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      if (tab.type === 'library') setActiveView('library');
      else if (tab.type === 'search') setActiveView('search');
      else if (tab.type === 'bookmarks') setActiveView('bookmarks');
    }
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least one tab
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const nextTab = newTabs[newTabs.length - 1];
      setActiveTabId(nextTab.id);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabItem = { id: newId, type: 'library', title: 'ספרייה' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setActiveView('library');
  };

  const handleOpenBook = (bookId: number, bookTitle: string, initialLine?: number) => {
    const tabId = `tab-book-${bookId}`;
    const existingTab = tabs.find(t => t.id === tabId);

    if (existingTab) {
      setActiveTabId(tabId);
    } else {
      const newTab: TabItem = {
        id: tabId,
        type: 'book',
        title: bookTitle,
        bookId,
        bookTitle,
        initialLine
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(tabId);
    }
  };

  const handleSidebarSelectView = (view: 'library' | 'search' | 'bookmarks' | 'storage' | 'settings') => {
    if (view === 'storage') {
      setIsStorageModalOpen(true);
      return;
    }
    if (view === 'settings') {
      setIsSettingsModalOpen(true);
      return;
    }

    setActiveView(view);

    // Switch or create corresponding tab
    if (view === 'library') {
      let tab = tabs.find(t => t.type === 'library');
      if (!tab) {
        tab = { id: `tab-lib-${Date.now()}`, type: 'library', title: 'ספרייה' };
        setTabs([...tabs, tab]);
      }
      setActiveTabId(tab.id);
    } else if (view === 'search') {
      let tab = tabs.find(t => t.type === 'search');
      if (!tab) {
        tab = { id: `tab-search-${Date.now()}`, type: 'search', title: 'חיפוש במאגר' };
        setTabs([...tabs, tab]);
      }
      setActiveTabId(tab.id);
    } else if (view === 'bookmarks') {
      let tab = tabs.find(t => t.type === 'bookmarks');
      if (!tab) {
        tab = { id: `tab-bm-${Date.now()}`, type: 'bookmarks', title: 'סימניות' };
        setTabs([...tabs, tab]);
      }
      setActiveTabId(tab.id);
    }
  };

  const handleAddBookmark = (newBm: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    const item: BookmarkItem = {
      ...newBm,
      id: `bm-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setBookmarks(prev => [item, ...prev]);
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleTriggerDownload = async () => {
    try {
      const res = await triggerLibraryDownload();
      setServerStatus(res.state);
    } catch (err) {
      console.error('Failed to trigger download', err);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return (
    <div
      className={`min-h-screen h-screen flex flex-col font-sans overflow-hidden ${
        settings.theme === 'dark' ? 'bg-stone-900 text-stone-100' : 'bg-amber-50/20 text-stone-900'
      }`}
    >
      {/* Header with Tabs & Brand Bar */}
      <Header
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        serverStatus={serverStatus}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        settings={settings}
        onUpdateSettings={newS => setSettings(prev => ({ ...prev, ...newS }))}
      />

      {/* Main Body Area: Sidebar Rail + Tab Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          onSelectView={handleSidebarSelectView}
        />

        {/* Tab View Router */}
        <main className="flex-1 flex overflow-hidden relative">
          {activeTab.type === 'library' && (
            <LibraryView
              catalog={catalog}
              onOpenBook={handleOpenBook}
              isLoading={isLoadingCatalog}
            />
          )}

          {activeTab.type === 'search' && (
            <SearchView
              onOpenBookAtLine={(bookId, bookTitle, line) =>
                handleOpenBook(bookId, bookTitle, line)
              }
            />
          )}

          {activeTab.type === 'book' && activeTab.bookId && activeTab.bookTitle && (
            <BookReader
              key={activeTab.id}
              bookId={activeTab.bookId}
              bookTitle={activeTab.bookTitle}
              initialLine={activeTab.initialLine}
              settings={settings}
              onAddBookmark={handleAddBookmark}
            />
          )}

          {activeTab.type === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              onRemoveBookmark={handleRemoveBookmark}
              onOpenBookAtLine={(bookId, bookTitle, line) =>
                handleOpenBook(bookId, bookTitle, line)
              }
            />
          )}
        </main>
      </div>

      {/* Storage Sync Modal */}
      <ServerStorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        serverStatus={serverStatus}
        onTriggerDownload={handleTriggerDownload}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={newS => setSettings(prev => ({ ...prev, ...newS }))}
      />
    </div>
  );
};

export default App;
