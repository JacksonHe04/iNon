import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function TextInput({ label, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
      />
    </div>
  );
}
