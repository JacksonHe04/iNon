'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';
import FilmDeskScene from '../scenes/FilmDeskScene';
import Modal from '../Modal';

interface FilmsSectionProps {
  data: any;
}

type FilmDetail = {
  title: string;
  description: string;
  director: string;
  country: string;
  link: string;
};

export default function FilmsSection({ data }: FilmsSectionProps) {
  const films = data?.films || [];
  const directors = data?.directors || [];
  const [selectedFilm, setSelectedFilm] = useState<FilmDetail | null>(null);

  return (
    <section id="films" className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-7xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center"
        >
          影片
        </motion.h2>

        <FilmDeskScene
          films={films}
          activeTitle={selectedFilm?.title ?? null}
          onSelect={(detail) =>
            setSelectedFilm({
              title: detail.title,
              description: detail.description,
              director: detail.director,
              country: detail.country,
              link: detail.link ?? '',
            })
          }
        />

        {/* 影片 */}
        <div className="mt-16 mb-12">
          <h3 className="text-2xl font-semibold mb-6">影片</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {films.map((film: any, idx: number) => (
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
                    setSelectedFilm({
                      title: film.name,
                      description: film.comment,
                      director: film.director,
                      country: film.country,
                      link: film.link,
                    })
                  }
                >
                  <h4 className="font-semibold mb-1">{film.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {film.director} · {film.country}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {film.comment}
                  </p>
                  {film.link && film.link.trim() !== '' && (
                    <a
                      href={film.link}
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

        {/* 导演 */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">导演</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directors.map((director: any, idx: number) => (
              <GlassCard key={idx} hover>
                <h4 className="font-semibold mb-1">{director.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{director.country}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {director.comment}
                </p>
                {director.link && director.link.trim() !== '' && (
                  <a
                    href={director.link}
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

        <Modal open={!!selectedFilm} onClose={() => setSelectedFilm(null)}>
          {selectedFilm && (
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{selectedFilm.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedFilm.director} · {selectedFilm.country}
              </p>
              <p className="text-gray-700 mb-4">{selectedFilm.description}</p>
              {selectedFilm.link && selectedFilm.link.trim() !== '' && (
                <a
                  href={selectedFilm.link}
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
