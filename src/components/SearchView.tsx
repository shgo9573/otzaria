import React, { useState } from 'react';
import { searchLibrary } from '../services/api';
import { SearchResultItem } from '../types/otzaria';
import { Search, Filter, BookOpen, ChevronLeft, Sparkles, Hash, FileText } from 'lucide-react';

interface SearchViewProps {
  onOpenBookAtLine: (bookId: number, bookTitle: string, lineIndex: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenBookAtLine }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [exactMatch, setExactMatch] = useState(false);
  const [gematriaSearch, setGematriaSearch] = useState(false);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [resultsCount, setResultsCount] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchLibrary(query, category, exactMatch, gematriaSearch);
      setResults(data.results);
      setResultsCount(data.resultsCount);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-amber-50/30 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        {/* Search Banner Header */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-800 text-amber-100 rounded-2xl shadow-inner">
              <Search className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-amber-950">
                חיפוש מתקדם במאגר אוצרייה
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                חיפוש טקסטואלי מלא בתוך כל עשרות אלפי הקטעים והספרים המאוחסנים בשרת
              </p>
            </div>
          </div>

          {/* Search Input & Controls */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="הקלד מילה, פסוק, ביטוי או נושא לחיפוש..."
                className="w-full bg-amber-50/40 border border-amber-300 rounded-2xl pr-11 pl-32 py-3.5 text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/50 shadow-inner"
              />
              <Search className="w-5 h-5 text-amber-800 absolute right-4 pointer-events-none" />

              <button
                type="submit"
                disabled={isSearching}
                className="absolute left-2 bg-amber-800 hover:bg-amber-900 text-amber-50 px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSearching ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-100 border-t-transparent" />
                ) : (
                  <>
                    <span>חפש במאגר</span>
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Scope & Mode Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-sans">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-700" />
                  סינון קטגוריה:
                </span>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none"
                >
                  <option value="all">כל המאגר</option>
                  <option value='תנ"ך'>תנ"ך בלבד</option>
                  <option value="משנה">משנה</option>
                  <option value="גמרא">גמרא</option>
                  <option value="הלכה">הלכה ושולחן ערוך</option>
                  <option value="חסידות">חסידות</option>
                  <option value="קבלה">קבלה</option>
                  <option value="מחשבה">מחשבה ומוסר</option>
                </select>
              </div>

              <div className="flex items-center gap-4 text-stone-800 font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exactMatch}
                    onChange={e => setExactMatch(e.target.checked)}
                    className="accent-amber-800 rounded"
                  />
                  <span>ביטוי מדויק</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gematriaSearch}
                    onChange={e => setGematriaSearch(e.target.checked)}
                    className="accent-amber-800 rounded"
                  />
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-amber-700" />
                    חיפוש בגימטריא
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results Summary */}
        {resultsCount !== null && (
          <div className="flex items-center justify-between bg-amber-100/60 px-5 py-2.5 rounded-2xl border border-amber-300/60 text-amber-950 font-serif font-bold text-sm">
            <span>
              תוצאות חיפוש עבור "{query}": {resultsCount} מופעים במאגר
            </span>
            <span className="text-xs font-sans font-normal text-amber-800">
              לחץ על תוצאה כדי לפתוח ישירות בקורא הספרים
            </span>
          </div>
        )}

        {/* Results List */}
        <div className="flex flex-col gap-3">
          {results.map((res, i) => (
            <div
              key={i}
              onClick={() => onOpenBookAtLine(res.bookId, res.bookTitle, res.lineIndex)}
              className="group bg-white p-5 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-800" />
                  <h3 className="text-base font-bold font-serif text-amber-950 group-hover:text-amber-800">
                    {res.bookTitle}
                  </h3>
                  <span className="text-xs text-stone-400 font-sans">
                    • שורה #{res.lineIndex}
                  </span>
                </div>
                <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-sans font-medium">
                  {res.categoryPath}
                </span>
              </div>

              <p className="text-sm font-serif leading-relaxed text-stone-800 bg-amber-50/50 p-3 rounded-xl border border-amber-100/80">
                "{res.snippet}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
