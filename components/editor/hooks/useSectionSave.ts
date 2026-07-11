'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { SaveStatus } from '../EditorSectionCard';

export function useSectionSave(sectionName: string, payload: any) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const isFirstRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Maintain a ref to the latest payload so the timeout save function always uses the latest data.
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const serializedPayload = JSON.stringify(payload);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setSaveStatus('saving');
    setErrorMessage('');

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/account/content/${sectionName}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadRef.current),
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
      }
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);

        // Immediate save on unmount if a change is pending.
        fetch(`/api/account/content/${sectionName}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadRef.current),
        }).catch((err) => console.error('Failed to auto-save on unmount:', err));
      }
    };
  }, [sectionName, serializedPayload, router]);

  return { saveStatus, errorMessage };
}
