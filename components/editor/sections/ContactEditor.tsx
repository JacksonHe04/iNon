'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Send } from 'lucide-react';

export default function ContactEditor({ initialData }: { initialData: ReadmeData }) {
  const [contact, setContact] = useState(initialData.contact);
  const { saveStatus, errorMessage, saveSection } = useSectionSave('contact');

  const handleSave = () => {
    saveSection(contact);
  };

  return (
    <EditorSectionCard
      title="13. 联系方式与平台账号 (Contact)"
      description="管理公开的联系方式（Email/微信等）以及外部社交与代码平台账号"
      icon={Send}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
      onSave={handleSave}
    >
      <ObjectArrayEditor
        title="联系方式 Contact Info"
        items={contact.contact_info}
        onChange={(next) => setContact({ ...contact, contact_info: next })}
        createItem={() => ({ method_name: '', content: '' })}
        getItemTitle={(item) => `${item.method_name || '方式'}: ${item.content || ''}`}
        fields={[
          { key: 'method_name', label: '联系方式名称', placeholder: '如: Email / WeChat / Telegram' },
          { key: 'content', label: '联系内容 / 账号', placeholder: '如: example@domain.com' },
        ]}
      />

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="社交与平台账号 Platform Accounts"
          items={contact.platform_accounts}
          onChange={(next) => setContact({ ...contact, platform_accounts: next })}
          createItem={() => ({ platform_name: '', username: '', homepage_link: '' })}
          getItemTitle={(item) => `${item.platform_name || '平台'}: ${item.username || ''}`}
          fields={[
            { key: 'platform_name', label: '平台名称', placeholder: '如: GitHub / Twitter / Bilibili' },
            { key: 'username', label: '用户名 / ID', placeholder: '如: @JacksonHe04' },
            { key: 'homepage_link', label: '个人主页 URL', placeholder: 'https://...' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
