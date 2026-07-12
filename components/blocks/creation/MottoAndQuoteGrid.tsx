import React from 'react';

interface MottoAndQuoteGridProps {
  items: string[];
}

export function MottoAndQuoteGrid({ items }: MottoAndQuoteGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((text, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 flex items-center justify-center text-center"
        >
          <p className="text-xs italic font-medium text-gray-800 dark:text-gray-200">
            “ {text} ”
          </p>
        </div>
      ))}
    </div>
  );
}
export default MottoAndQuoteGrid;
