'use client';

import React, { useState } from 'react';
import type { ReadmeData } from '@/types';
import EditorSectionCard from './EditorSectionCard';
import { TextInput } from './TextInput';
import { TextAreaInput } from './TextAreaInput';
import { StringListEditor } from './StringListEditor';
import { ImageInput } from './ImageInput';
import { ObjectArrayEditor } from './ObjectArrayEditor';
import { useSectionSave } from './hooks/useSectionSave';
import type { EditorSchema } from './types';

function getDeepValue(obj: any, path: string): any {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setDeepValue(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = current[part] ? { ...current[part] } : {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return newObj;
}

interface SchemaEditorEngineProps {
  initialData: ReadmeData;
  schema: EditorSchema;
  onDataChange: (nextData: any) => void;
}

export default function SchemaEditorEngine({ initialData, schema, onDataChange }: SchemaEditorEngineProps) {
  // 绑定特定模块的数据状态
  const [formData, setFormData] = useState(() => {
    // profile 需要特殊合并 basic 和 meta，因为它在 API 层面保存时是 { basic, meta }
    if (schema.id === 'profile') {
      return {
        basic: initialData.basic,
        meta: initialData.meta,
      };
    }
    return initialData[schema.id as keyof ReadmeData] || {};
  });

  const { saveStatus, errorMessage, triggerSave } = useSectionSave(schema.id);

  // Stateful tracking of active sub-tab group
  const [activeGroupId, setActiveGroupId] = useState(() => {
    return schema.groups && schema.groups.length > 0 ? schema.groups[0].id : null;
  });

  const handleFieldChange = (path: string, value: any) => {
    const nextData = setDeepValue(formData, path, value);
    setFormData(nextData);
    onDataChange(nextData);
    triggerSave(nextData);
  };

  // Filter fields based on selected sub-tab group if groups are defined
  const visibleFields = schema.fields.filter((field) => {
    if (!schema.groups || schema.groups.length === 0 || !activeGroupId) return true;
    const currentGroup = schema.groups.find((g) => g.id === activeGroupId);
    return currentGroup ? currentGroup.fields.includes(field.key) : true;
  });

  return (
    <EditorSectionCard
      title={schema.title}
      description={schema.description}
      icon={schema.icon}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="space-y-6">
        {/* Render sub-tabs if schema has groups config */}
        {schema.groups && schema.groups.length > 0 && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-500/5 dark:bg-gray-900/40 rounded-2xl border border-white/10 dark:border-gray-800/40 w-full overflow-x-auto whitespace-nowrap scrollbar-none">
            {schema.groups.map((group) => {
              const isActive = activeGroupId === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm border border-teal-500/10'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-6">
          {visibleFields.map((field) => {
            const val = getDeepValue(formData, field.key);

            switch (field.type) {
              case 'text':
                return (
                  <TextInput
                    key={field.key}
                    label={field.label}
                    value={val || ''}
                    placeholder={field.placeholder}
                    required={field.required}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                  />
                );

              case 'textarea':
                return (
                  <TextAreaInput
                    key={field.key}
                    label={field.label}
                    value={val || ''}
                    placeholder={field.placeholder}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                  />
                );

              case 'image':
                return (
                  <ImageInput
                    key={field.key}
                    label={field.label}
                    value={val || ''}
                    placeholder={field.placeholder}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                  />
                );

              case 'string-list':
                return (
                  <StringListEditor
                    key={field.key}
                    label={field.label}
                    value={val || []}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                  />
                );

              case 'object-array':
                return (
                  <ObjectArrayEditor
                    key={field.key}
                    title={field.label}
                    items={val || []}
                    createItem={field.createItem || (() => ({}))}
                    getItemTitle={field.getItemTitle || ((item) => item.name || '项目')}
                    fields={(field.subFields || []).map((sf) => ({
                      key: sf.key,
                      label: sf.label,
                      type: sf.type || 'text',
                      placeholder: sf.placeholder,
                    }))}
                    onChange={(nextVal) => handleFieldChange(field.key, nextVal)}
                  />
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
    </EditorSectionCard>
  );
}
