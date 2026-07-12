'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';
import ReadingDeskScene from '../scenes/ReadingDeskScene';
import Modal from '../Modal';

interface ReadingSectionProps {
  data: any;
}

type BookDetail = {
  title: string;
  description: string;
  author: string;
  country: string;
  link: string;
};

export default function ReadingSection({ data }: ReadingSectionProps) {
  const books = data?.books || [];
  const authors = data?.authors || [];
  const [selectedBook, setSelectedBook] = useState<BookDetail | null>(null);

  return (
    <section id="reading" className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-7xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center"
        >
          读书
        </motion.h2>

        <ReadingDeskScene
          books={books}
          activeTitle={selectedBook?.title ?? null}
          onSelect={(detail) =>
            setSelectedBook({
              title: detail.title,
              description: detail.description,
              author: detail.author,
              country: detail.country,
              link: detail.link ?? '',
            })
          }
        />

        {/* 书籍 */}
        <div className="mt-16 mb-12">
          <h3 className="text-2xl font-semibold mb-6">书籍</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard
                  hover
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedBook({
                      title: book.name,
                      description: book.comment,
                      author: book.author,
                      country: book.country,
                      link: book.link,
                    })
                  }
                >
                  <h4 className="font-semibold mb-1">{book.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {book.author} · {book.country}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {book.comment}
                  </p>
                  {book.link && book.link.trim() !== '' && (
                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      查看详情 →
                    </a>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 作家 */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">作家</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authors.map((author: any, idx: number) => (
              <GlassCard key={idx} hover>
                <h4 className="font-semibold mb-1">{author.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{author.country}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {author.comment}
                </p>
                {author.link && author.link.trim() !== '' && (
                  <a
                    href={author.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    查看详情 →
                  </a>
                )}
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 书籍详情弹窗 */}
        <Modal open={!!selectedBook} onClose={() => setSelectedBook(null)}>
          {selectedBook && (
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{selectedBook.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedBook.author} · {selectedBook.country}
              </p>
              <p className="text-gray-700 mb-4">{selectedBook.description}</p>
              {selectedBook.link && selectedBook.link.trim() !== '' && (
                <a
                  href={selectedBook.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  查看详情 →
                </a>
              )}
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
}
