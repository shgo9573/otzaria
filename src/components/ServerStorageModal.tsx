import React from 'react';
import { ServerStatus } from '../types/otzaria';
import { HardDrive, Download, CheckCircle2, RefreshCw, X, Database, Server } from 'lucide-react';

interface ServerStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStatus: ServerStatus | null;
  onTriggerDownload: () => void;
}

export const ServerStorageModal: React.FC<ServerStorageModalProps> = ({
  isOpen,
  onClose,
  serverStatus,
  onTriggerDownload
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-amber-200 shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-800 text-amber-100 rounded-2xl">
              <Server className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-amber-950">
                ניהול אחסון ומאגר בשרת
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                סנכרון והורדת מאגר אוצרייה המרכזי לאחסון השרת
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

        {/* Server Status Indicators */}
        <div className="grid grid-cols-2 gap-3 font-sans">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex flex-col gap-1">
            <span className="text-xs text-stone-500">מספר ספרים בשרת</span>
            <span className="text-xl font-bold text-amber-950 font-serif">
              {serverStatus ? `${serverStatus.totalBooks} ספרים` : '0'}
            </span>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex flex-col gap-1">
            <span className="text-xs text-stone-500">שטח אחסון בשרת</span>
            <span className="text-xl font-bold text-amber-950 font-serif">
              {serverStatus ? `${serverStatus.storageUsageMB} MB` : '0 MB'}
            </span>
          </div>
        </div>

        {/* Sync Progress State */}
        {serverStatus?.status === 'downloading' ? (
          <div className="bg-amber-100/80 p-5 rounded-2xl border border-amber-300 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-800" />
                מוריד ומעדכן מאגר ספרים בשרת...
              </span>
              <span>{serverStatus.progress}%</span>
            </div>
            <div className="w-full bg-amber-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-amber-800 h-full transition-all duration-500 rounded-full"
                style={{ width: `${serverStatus.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-xs font-sans text-stone-700 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="font-semibold text-stone-900">המאגר המרכזי מותקן ומוכן בשרת</p>
              <p className="text-stone-500 text-[11px]">
                עודכן לאחרונה: {serverStatus ? new Date(serverStatus.lastUpdated).toLocaleString('he-IL') : '-'}
              </p>
            </div>
          </div>
        )}

        {/* Download Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
          >
            סגור
          </button>

          <button
            onClick={onTriggerDownload}
            disabled={serverStatus?.status === 'downloading'}
            className="bg-amber-800 hover:bg-amber-900 text-amber-50 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>הורד/עדכן חבילת ספרים לשרת</span>
          </button>
        </div>
      </div>
    </div>
  );
};
