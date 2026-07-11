'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { BookOpen, User, ExternalLink } from 'lucide-react';
import BlockImage from './BlockImage';

export interface BookItem {
  name: string;
  author: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface AuthorItem {
  name: string;
  country: string;
  link: string;
  comment: string;
  image_url?: string;
}

interface BookBlockProps {
  books?: BookItem[];
  authors?: AuthorItem[];
  title?: string;
  colSpan?: number;
}

type SelectedDetail = {
  title: string;
  subTitle: string;
  comment: string;
  link?: string;
};

export default function BookBlock({
  books = [],
  authors = [],
  title = '电子书架',
  colSpan = 2,
}: BookBlockProps) {
  const [activeTab, setActiveTab] = useState<'books' | 'authors'>('books');
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);

  const getGradient = (idx: number) => {
    const gradients = [
      'from-indigo-400 to-purple-400',
      'from-purple-400 to-violet-400',
      'from-blue-400 to-indigo-400',
      'from-violet-400 to-fuchsia-400',
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <GlassCard className="p-5 space-y-5 hover:border-indigo-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {(
          [
            { id: 'books', label: '书籍', count: books.length },
            { id: 'authors', label: '作者', count: authors.length },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-70 ml-1">({tab.count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 min-h-[160px]">
        {activeTab === 'books' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {books.map((book, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: book.name,
                    subTitle: `${book.author} · ${book.country} · 书籍`,
                    comment: book.comment,
                    link: book.link,
                  })
                }
                className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-indigo-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <BlockImage
                    src={book.image_url}
                    alt={book.name}
                    fallback={
                      <div className={`aspect-video rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {book.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'authors' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {authors.map((author, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: author.name,
                    subTitle: `${author.country} · 作者`,
                    comment: author.comment,
                    link: author.link,
                  })
                }
                className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-indigo-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <BlockImage
                    src={author.image_url}
                    alt={author.name}
                    fallback={
                      <div className={`aspect-video rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx + 2)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {author.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{author.country}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selectedDetail} onClose={() => setSelectedDetail(null)}>
        {selectedDetail && (
          <div className="space-y-3.5 text-gray-700 dark:text-gray-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedDetail.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium">{selectedDetail.subTitle}</p>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
              “ {selectedDetail.comment} ”
            </p>
            {selectedDetail.link && selectedDetail.link.trim() !== '' && (
              <a
                href={selectedDetail.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-2"
              >
                <span>了解更多</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
