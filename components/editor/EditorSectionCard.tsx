'use client';

import React from 'react';
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EditorSectionCardProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSave?: () => void;
  saveStatus?: SaveStatus;
  errorMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export default function EditorSectionCard({
  title,
  description,
  icon: Icon,
  onSave,
  saveStatus = 'idle',
  errorMessage,
  children,
  className = '',
}: EditorSectionCardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-6 shadow-xl transition-all ${className}`}
    >
      {(saveStatus === 'error' || onSave) && (
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-3">
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs font-medium text-rose-500 animate-fadeIn" title={errorMessage}>
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage || '保存失败'}
              </span>
            )}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium text-xs shadow-md disabled:opacity-50 transition-all active:scale-95 ml-2"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>保存本 Block</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </div>
  );
}
