import React from 'react';
import { BookmarkItem } from '../types/otzaria';
import { Bookmark, Trash2, BookOpen, ChevronLeft } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  onOpenBookAtLine: (bookId: number, bookTitle: string, lineIndex: number) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onOpenBookAtLine
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-amber-50/30 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl border border-amber-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-800 text-amber-100 rounded-2xl shadow-inner">
              <Bookmark className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-amber-950">
                הסימניות וההערות האישיות שלי
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                סימניות שמורות לקטעים נבחרים ולחזק את הלימוד הלילי והיומי
              </p>
            </div>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
            {bookmarks.length} סימניות שמורות
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-amber-200/80 text-center flex flex-col items-center justify-center text-stone-500">
            <Bookmark className="w-12 h-12 text-amber-300 mb-3 stroke-[1.5]" />
            <p className="text-lg font-serif">אין עדיין סימניות שמורות.</p>
            <p className="text-xs font-sans text-stone-400 mt-1">
              במהלך הקריאה בספר, לחץ על האייקון של הסימנייה לצד השורה לשמירה מהירה.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookmarks.map(bm => (
              <div
                key={bm.id}
                onClick={() => onOpenBookAtLine(bm.bookId, bm.bookTitle, bm.lineIndex)}
                className="group bg-white p-5 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    <h3 className="text-base font-bold font-serif text-amber-950 group-hover:text-amber-800">
                      {bm.bookTitle}
                    </h3>
                    <span className="text-xs text-stone-400 font-sans">
                      • שורה #{bm.lineIndex}
                    </span>
                  </div>
                  <p className="text-sm font-serif text-stone-800 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                    "{bm.snippet}"
                  </p>
                  <span className="text-[10px] text-stone-400 font-sans">
                    נשמר בתאריך: {new Date(bm.createdAt).toLocaleDateString('he-IL')}
                  </span>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveBookmark(bm.id);
                  }}
                  className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  title="מחק סימנייה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
