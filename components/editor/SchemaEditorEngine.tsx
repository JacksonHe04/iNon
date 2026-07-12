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

export interface SubFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'image';
  placeholder?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'string-list' | 'image' | 'object-array';
  placeholder?: string;
  required?: boolean;
  // 仅用于 object-array
  createItem?: () => any;
  getItemTitle?: (item: any) => string;
  subFields?: SubFieldConfig[];
}

export interface EditorSchema {
  id: string; // db mutations 中的表名/对应节名，例如 'reading', 'education', 'films'
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
}

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
}

export default function SchemaEditorEngine({ initialData, schema }: SchemaEditorEngineProps) {
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

  const { saveStatus, errorMessage } = useSectionSave(schema.id, formData);

  const handleFieldChange = (path: string, value: any) => {
    setFormData((prev: any) => setDeepValue(prev, path, value));
  };

  return (
    <EditorSectionCard
      title={schema.title}
      description={schema.description}
      icon={schema.icon}
      saveStatus={saveStatus}
      errorMessage={errorMessage}
    >
      <div className="space-y-6">
        {schema.fields.map((field) => {
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
    </EditorSectionCard>
  );
}
