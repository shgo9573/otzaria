import React from 'react';
import { ReaderSettings } from '../types/otzaria';
import { Settings, Type, ZoomIn, ZoomOut, Eye, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl border border-amber-200 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-stone-900">
        <div className="flex items-center justify-between pb-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-800 text-amber-100 rounded-2xl">
              <Settings className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-amber-950">
                הגדרות תצוגה וגופנים
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                התאמת חוויית הקריאה בספרים לפי העדפתך
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 text-sm font-sans">
          {/* Font Family Choice */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-stone-800 flex items-center gap-2">
              <Type className="w-4 h-4 text-amber-800" />
              גופן הטקסט התורני:
            </label>
            <select
              value={settings.fontFamily}
              onChange={e => onUpdateSettings({ fontFamily: e.target.value as any })}
              className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-3 text-stone-900 font-serif text-base focus:outline-none"
            >
              <option value="Frank Ruhl Hofshi">פרנק רוהל (קלאסי)</option>
              <option value="David Libre">דוד ליברה</option>
              <option value="Heebo">היבו (מודרני וקריא)</option>
            </select>
          </div>

          {/* Font Size Adjustment */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between font-semibold text-stone-800">
              <span>גודל הגופן:</span>
              <span className="text-amber-900">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={36}
              step={2}
              value={settings.fontSize}
              onChange={e => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-amber-800 cursor-pointer"
            />
          </div>

          {/* Show Nikud Toggle */}
          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="font-semibold text-stone-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-800" />
              הצגת ניקוד בטקסט
            </span>
            <input
              type="checkbox"
              checked={settings.showNikud}
              onChange={e => onUpdateSettings({ showNikud: e.target.checked })}
              className="w-5 h-5 accent-amber-800 cursor-pointer rounded"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-amber-800 hover:bg-amber-900 text-amber-50 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            אישור וסגירה
          </button>
        </div>
      </div>
    </div>
  );
};
