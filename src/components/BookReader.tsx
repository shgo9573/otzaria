import React, { useState, useEffect } from 'react';
import { getBookContent, getBookToc, getBookLinks } from '../services/api';
import { TocNode, CommentaryLink, ReaderSettings, BookmarkItem } from '../types/otzaria';
import {
  List,
  Search,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Type,
  Bookmark,
  Share2,
  Copy,
  Layers,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface BookReaderProps {
  bookId: number;
  bookTitle: string;
  initialLine?: number;
  settings: ReaderSettings;
  onAddBookmark: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  bookId,
  bookTitle,
  initialLine,
  settings,
  onAddBookmark
}) => {
  const [content, setContent] = useState<string>('');
  const [toc, setToc] = useState<TocNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Panels state
  const [showTocPanel, setShowTocPanel] = useState<boolean>(false);
  const [showCommentaryPanel, setShowCommentaryPanel] = useState<boolean>(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(initialLine || null);
  const [commentaries, setCommentaries] = useState<CommentaryLink[]>([]);
  const [inBookSearch, setInBookSearch] = useState<string>('');
  const [showInBookSearchBox, setShowInBookSearchBox] = useState<boolean>(false);

  // Reader typography settings
  const [fontSize, setFontSize] = useState<number>(settings.fontSize || 20);
  const [showNikud, setShowNikud] = useState<boolean>(settings.showNikud ?? true);
  const [fontFamily, setFontFamily] = useState<string>(settings.fontFamily || 'Frank Ruhl Hofshi');

  // Load Book Content and Toc
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([getBookContent(bookId), getBookToc(bookId)])
      .then(([contentData, tocData]) => {
        if (!isMounted) return;
        setContent(contentData.content);
        setToc(tocData.toc);
        setIsLoading(false);

        if (initialLine) {
          setSelectedLineIndex(initialLine);
          loadLineCommentaries(initialLine);
        }
      })
      .catch(err => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookId]);

  // Load commentaries for a line
  const loadLineCommentaries = async (lineIdx: number) => {
    try {
      const data = await getBookLinks(bookId, lineIdx);
      setCommentaries(data.links);
      setShowCommentaryPanel(true);
    } catch (err) {
      console.error('Failed to load line commentaries', err);
    }
  };

  const handleLineClick = (idx: number) => {
    setSelectedLineIndex(idx);
    loadLineCommentaries(idx);
  };

  // Strip nikud if toggled off
  const processNikud = (text: string) => {
    if (showNikud) return text;
    // Remove Hebrew vocalization diacritics
    return text.replace(/[\u0591-\u05C7]/g, '');
  };

  const lines = content.split('\n');

  // Filtered lines for in-book search
  const matchingLineIndices = lines
    .map((line, idx) => (inBookSearch.trim() && line.includes(inBookSearch) ? idx : null))
    .filter((idx): idx is number => idx !== null);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-amber-50/20 text-stone-800">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-800 border-t-transparent mb-4"></div>
        <p className="text-lg font-serif">טוען את הספר משרת האוצרייה...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-amber-50/20 overflow-hidden select-text">
      {/* Reader Secondary Toolbar (סרגל כלים לקריאה) */}
      <div className="bg-amber-100/80 border-b border-amber-200/90 px-4 py-2 flex items-center justify-between shadow-xs select-none z-10 shrink-0">
        <div className="flex items-center gap-2">
          {/* Table of Contents Button */}
          <button
            onClick={() => setShowTocPanel(!showTocPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTocPanel
                ? 'bg-amber-800 text-amber-50 border-amber-900 shadow-xs'
                : 'bg-white hover:bg-amber-200/60 text-stone-800 border-amber-300'
            }`}
            title="תוכן עניינים"
          >
            <List className="w-4 h-4 text-amber-700" />
            <span>תוכן עניינים</span>
          </button>

          {/* Commentaries & Links Button */}
          <button
            onClick={() => setShowCommentaryPanel(!showCommentaryPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showCommentaryPanel
                ? 'bg-amber-800 text-amber-50 border-amber-900 shadow-xs'
                : 'bg-white hover:bg-amber-200/60 text-stone-800 border-amber-300'
            }`}
            title="מפרשים וקישורים"
          >
            <Layers className="w-4 h-4 text-amber-700" />
            <span>מפרשים ודורות</span>
          </button>

          {/* In-Book Search Toggle */}
          <button
            onClick={() => setShowInBookSearchBox(!showInBookSearchBox)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showInBookSearchBox
                ? 'bg-amber-800 text-amber-50 border-amber-900 shadow-xs'
                : 'bg-white hover:bg-amber-200/60 text-stone-800 border-amber-300'
            }`}
            title="חיפוש בתוך הספר"
          >
            <Search className="w-4 h-4 text-amber-700" />
            <span>חיפוש בספר</span>
          </button>
        </div>

        {/* Reader Typography Controls */}
        <div className="flex items-center gap-3">
          {/* Nikud Toggle */}
          <button
            onClick={() => setShowNikud(!showNikud)}
            className={`px-2.5 py-1 rounded-md text-xs font-serif font-bold border transition-colors ${
              showNikud
                ? 'bg-amber-800 text-amber-50 border-amber-900'
                : 'bg-white text-stone-700 border-amber-300'
            }`}
            title="הצג/הסתר ניקוד"
          >
            ניקוד
          </button>

          {/* Font Selector */}
          <div className="flex items-center gap-1 bg-white border border-amber-300 rounded-md px-2 py-0.5 text-xs">
            <Type className="w-3.5 h-3.5 text-amber-700" />
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              className="bg-transparent text-stone-900 font-sans focus:outline-none cursor-pointer"
            >
              <option value="Frank Ruhl Hofshi">פרנק רוהל</option>
              <option value="David Libre">דוד ליברה</option>
              <option value="Heebo">היבו (מודרני)</option>
            </select>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-white border border-amber-300 rounded-md p-0.5 text-xs">
            <button
              onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
              className="p-1 hover:bg-amber-200/50 rounded"
              title="הקטן גופן"
            >
              <ZoomOut className="w-3.5 h-3.5 text-stone-700" />
            </button>
            <span className="px-1 text-stone-800 font-semibold text-[11px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(36, prev + 2))}
              className="p-1 hover:bg-amber-200/50 rounded"
              title="הגדל גופן"
            >
              <ZoomIn className="w-3.5 h-3.5 text-stone-700" />
            </button>
          </div>
        </div>
      </div>

      {/* In-Book Search Box (When toggled) */}
      {showInBookSearchBox && (
        <div className="bg-amber-100/90 border-b border-amber-300 px-4 py-2.5 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={inBookSearch}
              onChange={e => setInBookSearch(e.target.value)}
              placeholder="חפש מילה או ביטוי בתוך הספר..."
              className="w-full bg-white border border-amber-300 rounded-lg pr-9 pl-3 py-1.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700/50"
              autoFocus
            />
            <Search className="w-4 h-4 text-amber-700 absolute right-3 top-2.5" />
          </div>
          <div className="text-xs text-amber-900 font-medium">
            {inBookSearch.trim()
              ? `נמצאו ${matchingLineIndices.length} תוצאות בספר זה`
              : 'הקלד מילה לחיפוש בספר'}
          </div>
          <button
            onClick={() => setShowInBookSearchBox(false)}
            className="p-1 text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reader Main Content Area with Optional Side Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of Contents Side Drawer (תוכן עניינים) */}
        {showTocPanel && (
          <div className="w-72 bg-amber-50 border-l border-amber-300/80 p-4 overflow-y-auto shrink-0 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-base">
                <List className="w-4 h-4 text-amber-800" />
                <span>תוכן עניינים</span>
              </div>
              <button
                onClick={() => setShowTocPanel(false)}
                className="p-1 hover:bg-amber-200 rounded"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-sm font-serif">
              {toc.map((node, i) => (
                <div key={i} className="flex flex-col">
                  <button
                    onClick={() => {
                      setSelectedLineIndex(node.index);
                      const el = document.getElementById(`line-${node.index}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="text-right px-2 py-1.5 hover:bg-amber-200/60 rounded font-semibold text-amber-950 transition-colors"
                  >
                    {node.title}
                  </button>
                  {node.children && (
                    <div className="pr-4 flex flex-col border-r border-amber-300/80 my-0.5 gap-0.5">
                      {node.children.map((child, j) => (
                        <button
                          key={j}
                          onClick={() => {
                            setSelectedLineIndex(child.index);
                            const el = document.getElementById(`line-${child.index}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="text-right px-2 py-1 text-xs hover:bg-amber-200/40 rounded text-stone-800 transition-colors"
                        >
                          {child.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Reader Main Canvas */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-amber-50/40 flex flex-col items-center">
          <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col gap-4">
            {/* Book Title Banner inside Text */}
            <div className="text-center pb-6 border-b-2 border-amber-200/80 mb-4">
              <h1 className="text-3xl font-bold font-serif text-amber-950 mb-2">
                {bookTitle}
              </h1>
              <span className="text-xs font-sans text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/50">
                מאגר אוצרייה - שרת מרכזי
              </span>
            </div>

            {/* Render Lines */}
            <div
              className="leading-relaxed flex flex-col gap-2 dir-rtl text-stone-900"
              style={{ fontFamily, fontSize: `${fontSize}px` }}
            >
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isSelected = selectedLineIndex === lineNum;
                const isHeading = line.startsWith('פרק') || line.startsWith('ספר') || line.startsWith('מסכת') || line.startsWith('סימן') || line.startsWith('הקדמ');
                const isSearchMatch = inBookSearch.trim() && line.includes(inBookSearch);

                return (
                  <div
                    key={idx}
                    id={`line-${lineNum}`}
                    onClick={() => handleLineClick(lineNum)}
                    className={`group relative p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100/90 border-r-4 border-amber-700 shadow-xs font-medium'
                        : isSearchMatch
                        ? 'bg-amber-200/80 font-medium'
                        : 'hover:bg-amber-100/40'
                    } ${isHeading ? 'font-serif font-bold text-amber-950 text-xl my-3 text-center border-b border-amber-200/50 pb-2' : ''}`}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="flex-1 leading-relaxed">
                        {processNikud(line)}
                      </span>

                      {/* Line Actions (Bookmark & Copy) */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-amber-800 shrink-0">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAddBookmark({
                              bookId,
                              bookTitle,
                              lineIndex: lineNum,
                              snippet: line.substring(0, 80)
                            });
                          }}
                          className="p-1 hover:bg-amber-200 rounded"
                          title="שמור כסימנייה"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(line);
                          }}
                          className="p-1 hover:bg-amber-200 rounded"
                          title="העתק שורה זו"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Commentaries & Links Drawer (מפרשים ודורות בשפליט מקביל) */}
        {showCommentaryPanel && (
          <div className="w-80 bg-stone-100 border-r border-amber-300 p-4 overflow-y-auto shrink-0 flex flex-col gap-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-base">
                <Layers className="w-4 h-4 text-amber-800" />
                <span>מפרשים וקישורים</span>
              </div>
              <button
                onClick={() => setShowCommentaryPanel(false)}
                className="p-1 hover:bg-amber-200 rounded"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>

            {selectedLineIndex ? (
              <div className="flex flex-col gap-3">
                <div className="bg-amber-100/80 p-3 rounded-xl border border-amber-300/80 text-xs text-amber-950 font-medium">
                  מציג מפרשים לשורה #{selectedLineIndex}
                </div>

                {commentaries.length === 0 ? (
                  <p className="text-xs text-stone-500 font-sans p-2">
                    טוען מפרשים וקישורים מקבילים...
                  </p>
                ) : (
                  commentaries.map((link, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-amber-900 text-sm">
                          {link.sourceBook}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-sans">
                          {link.category}
                        </span>
                      </div>
                      <p className="text-xs font-serif leading-relaxed text-stone-800">
                        {link.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500 font-sans p-4 text-center">
                לחץ על שורה בספר כדי לראות את המפרשים והקישורים המתאימים לה.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
