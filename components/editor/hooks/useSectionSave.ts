'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SaveStatus } from '../EditorSectionCard';

// Global map to sequence saves for each section to prevent overlapping fetch race conditions
const saveQueueMap: Record<string, Promise<any>> = {};
// Global map to record the last successfully-saved payload per section,
// so unmount cleanup / next save can short-circuit when nothing changed.
const lastSavedMap: Record<string, string> = {};

function isShallowEqualJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useSectionSave(sectionName: string) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Maintain a ref to the latest payload so that unmount can save the exact state
  const payloadRef = useRef<any>(null);

  // Clear timeout on unmount and perform immediate save if pending
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const dataToSave = payloadRef.current;
      if (!dataToSave) return;

      // Skip the auto-save if the data we are about to send is byte-identical
      // to what was last successfully persisted. This prevents tab-switch /
      // route-change / StrictMode double-invocation from creating duplicate rows.
      const lastSavedJson = lastSavedMap[sectionName];
      if (lastSavedJson && isShallowEqualJson(dataToSave, JSON.parse(lastSavedJson))) {
        return;
      }

      const previousPromise = saveQueueMap[sectionName] || Promise.resolve();
      const currentPromise = previousPromise
        .then(async () => {
          try {
            const res = await fetch(`/api/account/content/${sectionName}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataToSave),
            });
            if (res.ok) {
              lastSavedMap[sectionName] = JSON.stringify(dataToSave);
            }
          } catch (err) {
            console.error('Failed to auto-save on unmount:', err);
          }
        })
        .catch(() => {});
      saveQueueMap[sectionName] = currentPromise;
    };
  }, [sectionName]);

  const triggerSave = (nextPayload: any) => {
    payloadRef.current = nextPayload;

    // If the new payload is identical to the last successfully-saved payload,
    // there's nothing to do — reset state and bail out. This is the main
    // safeguard against re-entry (StrictMode, tab switch, parent re-render).
    const lastSavedJson = lastSavedMap[sectionName];
    if (lastSavedJson && isShallowEqualJson(nextPayload, JSON.parse(lastSavedJson))) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setSaveStatus('saved');
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving');
    setErrorMessage('');

    timeoutRef.current = setTimeout(() => {
      const dataToSave = payloadRef.current;
      const previousPromise = saveQueueMap[sectionName] || Promise.resolve();

      const currentPromise = previousPromise
        .then(async () => {
          try {
            const res = await fetch(`/api/account/content/${sectionName}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataToSave),
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.detail || errData.error || '保存失败');
            }

            // Record the just-saved payload so future identical saves are skipped.
            lastSavedMap[sectionName] = JSON.stringify(dataToSave);

            setSaveStatus('saved');
            router.refresh();
            setTimeout(() => {
              setSaveStatus((current) => (current === 'saved' ? 'idle' : current));
            }, 2000);
          } catch (err: any) {
            setSaveStatus('error');
            setErrorMessage(err.message || '网络或系统异常');
            throw err;
          }
        })
        .catch(() => {
          // Swallow error to prevent blocking subsequent saves
        });

      saveQueueMap[sectionName] = currentPromise;
      timeoutRef.current = null;
    }, 800);
  };

  return { saveStatus, errorMessage, triggerSave };
}
