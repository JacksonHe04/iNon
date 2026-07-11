'use client';

import { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from '../EditorSectionCard';
import { StringListEditor, ObjectArrayEditor } from '../EditorControls';
import { useSectionSave } from '../hooks/useSectionSave';
import { Code2 } from 'lucide-react';

export default function DevelopmentEditor({ initialData }: { initialData: ReadmeData }) {
  const [development, setDevelopment] = useState(initialData.development);
  const { saveStatus, errorMessage } = useSectionSave('development', development);

  return (
    <EditorSectionCard
      title="6. 技术与开源项目 (Development)"
      description="管理个人/开源项目集、技术栈、专业技能及常用的开发工具与软件"
      icon={Code2}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        <StringListEditor
          label="主要技术栈 Tech Stack"
          value={development.skills?.tech_stack || []}
          onChange={(val) =>
            setDevelopment({
              ...development,
              skills: { ...development.skills, tech_stack: val },
            })
          }
        />
        <StringListEditor
          label="专业领域 / 技能 Expertise"
          value={development.skills?.expertise || []}
          onChange={(val) =>
            setDevelopment({
              ...development,
              skills: { ...development.skills, expertise: val },
            })
          }
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="开源与个人项目 Projects"
          items={development.projects}
          onChange={(next) => setDevelopment({ ...development, projects: next })}
          createItem={() => ({
            project_name: '',
            github: '',
            link: '',
            description: '',
            tech_stack: [],
            role: [],
            start_date: '',
            end_date: '',
            report_link: '',
          })}
          getItemTitle={(item) => item.project_name || '未命名项目'}
          fields={[
            { key: 'project_name', label: '项目名称', placeholder: '如: iNon Personal OS' },
            { key: 'github', label: 'GitHub 仓库地址', placeholder: 'https://github.com/...' },
            { key: 'link', label: '在线演示 / Live Link', placeholder: 'https://...' },
            { key: 'start_date', label: '开始时间', placeholder: '2024.01' },
            { key: 'end_date', label: '结束时间', placeholder: '至今' },
            { key: 'report_link', label: '总结报告 / 文档链接', placeholder: 'https://...' },
            { key: 'description', label: '项目描述', type: 'textarea' },
            { key: 'tech_stack', label: '使用技术栈', type: 'string-list' },
            { key: 'role', label: '担任角色', type: 'string-list' },
          ]}
        />
      </div>

      <div className="border-t border-white/10 pt-4">
        <ObjectArrayEditor
          title="常用开发工具 Dev Tools"
          items={development.dev_tools}
          onChange={(next) => setDevelopment({ ...development, dev_tools: next })}
          createItem={() => ({ name: '', link: '', comment: '', tags: [] })}
          getItemTitle={(item) => item.name || '工具名称'}
          fields={[
            { key: 'name', label: '工具名称', placeholder: '如: VS Code / Raycast' },
            { key: 'link', label: '官方网址', placeholder: 'https://...' },
            { key: 'comment', label: '推荐评语', type: 'textarea' },
            { key: 'tags', label: '标签分类', type: 'string-list' },
          ]}
        />
      </div>
    </EditorSectionCard>
  );
}
