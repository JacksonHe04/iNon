import type React from 'react';

export type PrimitiveFieldType = 'text' | 'textarea' | 'string-list' | 'image';
export type FieldType = PrimitiveFieldType | 'object-array';

export type SubFieldConfig = {
  key: string;
  label: string;
  type?: PrimitiveFieldType;
  placeholder?: string;
};

export type FieldConfig =
  | (SubFieldConfig & {
      type: PrimitiveFieldType;
      required?: boolean;
    })
  | {
      key: string;
      label: string;
      type: 'object-array';
      placeholder?: string;
      required?: boolean;
      createItem?: () => any;
      getItemTitle?: (item: any) => string;
      subFields?: SubFieldConfig[];
    };

export type FieldGroup = {
  id: string;
  label: string;
  fields: string[];
};

export type EditorSchema = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
  groups?: FieldGroup[];
};
