'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SaveStatus } from '../EditorSectionCard';

// Global map to sequence saves for each section to prevent overlapping fetch race conditions
const saveQueueMap: Record<string, Promise<any>> = {};

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
        const dataToSave = payloadRef.current;
        if (dataToSave) {
          const previousPromise = saveQueueMap[sectionName] || Promise.resolve();
          const currentPromise = previousPromise
            .then(async () => {
              try {
                await fetch(`/api/account/content/${sectionName}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(dataToSave),
                });
              } catch (err) {
                console.error('Failed to auto-save on unmount:', err);
              }
            })
            .catch(() => {});
          saveQueueMap[sectionName] = currentPromise;
        }
      }
    };
  }, [sectionName]);

  const triggerSave = (nextPayload: any) => {
    payloadRef.current = nextPayload;

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

