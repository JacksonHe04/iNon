'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SaveStatus } from '../EditorSectionCard';

export function useSectionSave(sectionName: string) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const saveSection = async (payload: any) => {
    setSaveStatus('saving');
    setErrorMessage('');
    try {
      const res = await fetch(`/api/account/content/${sectionName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.error || '保存失败');
      }

      setSaveStatus('saved');
      router.refresh();
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || '网络或系统异常');
    }
  };

  return { saveStatus, errorMessage, saveSection };
}
