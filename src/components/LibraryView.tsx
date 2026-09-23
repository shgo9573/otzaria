import React, { useState } from 'react';
import { CatalogData, BookItem, CategoryNode } from '../types/otzaria';
import { Search, Folder, BookOpen, ChevronLeft, ChevronDown, Tag, Sparkles, Filter } from 'lucide-react';

interface LibraryViewProps {
  catalog: CatalogData | null;
  onOpenBook: (bookId: number, bookTitle: string) => void;
  isLoading: boolean;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ catalog, onOpenBook, isLoading }) => {
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'tanakh': true,
    'halakha': true,
    'gemara': true
  });

  if (isLoading || !catalog) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-amber-50/40 text-stone-700">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-800 border-t-transparent mb-4"></div>
        <p className="text-lg font-serif">טוען קטלוג ספרים מהשרת...</p>
      </div>
    );
  }

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Filter books based on search text and selected category
  const filteredBooks = catalog.books.filter(book => {
    const matchesSearch =
      filterText.trim() === '' ||
      book.title.includes(filterText) ||
      (book.author && book.author.includes(filterText)) ||
      book.categoryPath.includes(filterText);

    const matchesCategory =
      !selectedCategory || book.categoryPath.startsWith(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-amber-50/30">
      {/* Right Navigation Panel: Category Tree (עץ קטגוריות) */}
      <div className="w-full md:w-80 border-l border-amber-200/80 bg-stone-100/60 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 shadow-sm">
        {/* Search input for Library */}
        <div className="relative">
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="סינון ספרים וקטגוריות..."
            className="w-full bg-white border border-amber-300 rounded-xl pr-9 pl-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700/50 shadow-inner"
          />
          <Search className="w-4 h-4 text-amber-700 absolute right-3 top-2.5 pointer-events-none" />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="absolute left-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
            >
              ניקוי
            </button>
          )}
        </div>

        {/* Categories Header */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
          <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-base">
            <Filter className="w-4 h-4 text-amber-800" />
            <span>ספריית המקורות</span>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-amber-800 hover:underline font-sans"
            >
              הצג הכל
            </button>
          )}
        </div>

        {/* Category Tree Navigation */}
        <div className="flex flex-col gap-1 text-sm font-sans">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-right font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-amber-800 text-amber-50 font-semibold shadow-sm'
                : 'hover:bg-amber-200/50 text-stone-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-600" />
              <span>כל המאגר ({catalog.books.length})</span>
            </div>
          </button>

          {catalog.categories.map(cat => {
            const isExpanded = expandedCategories[cat.id];
            const isSelected = selectedCategory === cat.path;

            return (
              <div key={cat.id} className="flex flex-col">
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-right cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-800 text-amber-50 font-semibold shadow-sm'
                      : 'hover:bg-amber-200/50 text-stone-800'
                  }`}
                  onClick={() => setSelectedCategory(cat.path)}
                >
                  <div className="flex items-center gap-2">
                    {cat.children && cat.children.length > 0 ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleCategoryExpand(cat.id);
                        }}
                        className="p-1 hover:bg-amber-300/40 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-amber-900" />
                        ) : (
                          <ChevronLeft className="w-3.5 h-3.5 text-amber-900" />
                        )}
                      </button>
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-700" />
                    )}
                    <span className="font-serif font-medium">{cat.name}</span>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && cat.children && (
                  <div className="pr-4 flex flex-col border-r-2 border-amber-200/80 my-1 gap-0.5">
                    {cat.children.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => setSelectedCategory(sub.path)}
                        className={`text-right px-3 py-1.5 rounded-md text-xs font-serif transition-colors ${
                          selectedCategory === sub.path
                            ? 'bg-amber-700 text-amber-50 font-bold'
                            : 'hover:bg-amber-200/40 text-stone-700'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Books Grid View */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        {/* Active Filter Banner */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm">
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-950">
              {selectedCategory ? `קטגוריה: ${selectedCategory}` : 'כל הספרים במאגר'}
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              נמצאו {filteredBooks.length} ספרים זמינים לקריאה בשרת
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium bg-amber-100/60 text-amber-900 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>מאגר אוצרייה מעודכן בשרת</span>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-stone-500">
            <BookOpen className="w-12 h-12 text-amber-400 mb-3 stroke-[1.5]" />
            <p className="text-lg font-serif">לא נמצאו ספרים התואמים את הנדרש.</p>
            <button
              onClick={() => {
                setFilterText('');
                setSelectedCategory(null);
              }}
              className="mt-3 text-sm text-amber-800 underline font-sans font-medium"
            >
              אפס סינון
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                onClick={() => onOpenBook(book.id, book.title)}
                className="group bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold font-serif text-amber-950 group-hover:text-amber-800 transition-colors leading-snug">
                      {book.title}
                    </h3>
                    <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/50 shrink-0">
                      {book.fileType.toUpperCase()}
                    </span>
                  </div>

                  {book.author && (
                    <p className="text-xs font-sans text-stone-600 mb-1 flex items-center gap-1">
                      <span className="font-semibold text-amber-900">מחבר:</span> {book.author}
                    </p>
                  )}

                  {book.heEra && (
                    <div className="flex items-center gap-1 text-[11px] font-sans text-amber-800 mb-3">
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>תקופה: {book.heEra}</span>
                    </div>
                  )}

                  <p className="text-[11px] font-sans text-stone-400 truncate dir-rtl">
                    {book.categoryPath}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-semibold text-amber-900 group-hover:text-amber-700">
                  <span>פתח ספר לקריאה</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
