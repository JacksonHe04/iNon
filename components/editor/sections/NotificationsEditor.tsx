'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Bell } from 'lucide-react';

export default function NotificationsEditor({ initialData }: { initialData: ReadmeData }) {
  const [notifications, setNotifications] = useState(
    () =>
      (initialData.notifications || [])
        .slice()
        .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  );
  const { saveStatus, errorMessage, saveSection } = useSectionSave('notifications');

  const handleSave = () => {
    saveSection(notifications);
  };

  return (
    <EditorSectionCard
      title="15. 动态与公告 (Notifications)"
      description="发布并管理在个人主页顶部或时间线展示的最新动态、里程碑或告示"
      icon={Bell}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="动态列表 Notifications"
        items={notifications}
        onChange={(next) => setNotifications(next)}
        createItem={() => ({ date: new Date().toISOString().split('T')[0], text: '', type: 'info' })}
        getItemTitle={(item) => `${item.date || '日期'}: ${item.text || ''}`}
        fields={[
          { key: 'date', label: '发布日期', placeholder: '如: 2024-07-06' },
          { key: 'type', label: '动态类型', placeholder: '如: info / update / release' },
          { key: 'text', label: '动态内容', type: 'textarea', placeholder: '如: 发布了 iNon 个人操作系统 v2.0 !' },
        ]}
      />
    </EditorSectionCard>
  );
}
