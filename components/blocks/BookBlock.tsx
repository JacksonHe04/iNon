'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { BookOpen, ExternalLink } from 'lucide-react';

export interface BookItem {
  id: string;
  name: string;
  author?: string;
  country?: string;
  link?: string;
  comment?: string;
}

interface BookBlockProps {
  items: BookItem[];
  title?: string;
}

export default function BookBlock({ items, title = '电子书架' }: BookBlockProps) {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  return (
    <GlassCard className="p-5 space-y-4 hover:border-indigo-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 本藏书</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedBook(item)}
            className="group relative flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-indigo-400/50 transition space-x-3 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate min-w-0">
              <span className="text-lg">📚</span>
              <div className="truncate min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate font-sans">
                  {item.name}
                </h4>
                {item.author && (
                  <p className="text-[11px] text-gray-500 truncate">{item.author}</p>
                )}
              </div>
            </div>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg transition flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!selectedBook} onClose={() => setSelectedBook(null)}>
        {selectedBook && (
          <div className="space-y-3.5 text-gray-700 dark:text-gray-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedBook.name}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              {selectedBook.author} {selectedBook.country ? `· ${selectedBook.country}` : ''}
            </p>
            {selectedBook.comment && (
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
                “ {selectedBook.comment} ”
              </p>
            )}
            {selectedBook.link && selectedBook.link.trim() !== '' && (
              <a
                href={selectedBook.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
              >
                <span>查看详情</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
