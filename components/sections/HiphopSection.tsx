'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';
import OverflowTooltip from '../OverflowTooltip';

interface HiphopSectionProps {
  data: any;
}

type Detail = {
  title: string;
  meta: string;
  description: string;
  link?: string;
};

export default function HiphopSection({ data }: HiphopSectionProps) {
  const albums = data?.albums || [];
  const songs = data?.songs || [];
  const musicians = data?.musicians || [];
  const [selectedDetail, setSelectedDetail] = useState<Detail | null>(null);

  return (
    <section id="hiphop" className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="max-w-7xl w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-12 text-center"
        >
          嘻哈
        </motion.h2>

        <HiphopGrid
          title="专辑"
          data={albums.map((album: any, idx: number) => ({
            id: `hiphop-album-${idx}`,
            order: idx + 1,
            label: 'Album',
            gradient: 'from-orange-400 to-red-400',
            name: album.name,
            meta: album.artist,
            subMeta: album.comment,
            detail: {
              title: album.name,
              meta: `${album.artist} · 专辑`,
              description: album.comment,
              link: album.link,
            },
          }))}
          onSelect={setSelectedDetail}
        />

        <HiphopGrid
          title="单曲"
          data={songs.map((song: any, idx: number) => ({
            id: `hiphop-song-${idx}`,
            order: idx + 1,
            label: 'Song',
            gradient: 'from-yellow-400 to-orange-400',
            name: song.name,
            meta: song.artist,
            subMeta: song.album,
            detail: {
              title: song.name,
              meta: `${song.artist} · 单曲`,
              description: song.comment || song.album,
              link: song.link,
            },
          }))}
          onSelect={setSelectedDetail}
        />

        <HiphopGrid
          title="音乐人"
          data={musicians.map((musician: any, idx: number) => ({
            id: `hiphop-musician-${idx}`,
            order: idx + 1,
            label: 'Artist',
            gradient: 'from-pink-400 to-rose-400',
            name: musician.name,
            meta: musician.region,
            subMeta: musician.comment,
            detail: {
              title: musician.name,
              meta: `${musician.region} · 音乐人`,
              description: musician.comment,
              link: musician.link,
            },
          }))}
          onSelect={setSelectedDetail}
        />
      </div>

      <Modal open={!!selectedDetail} onClose={() => setSelectedDetail(null)}>
        {selectedDetail && (
          <div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">{selectedDetail.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedDetail.meta}</p>
            <p className="text-gray-700 mb-4">{selectedDetail.description}</p>
            {selectedDetail.link && selectedDetail.link.trim() !== '' && (
              <a
                href={selectedDetail.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                了解更多 →
              </a>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

function HiphopGrid({
  title,
  data,
  onSelect,
}: {
  title: string;
  data: Array<{
    id: string;
    order: number;
    label: string;
    gradient: string;
    name: string;
    meta: string;
    subMeta: string;
    detail: Detail;
  }>;
  onSelect: (detail: Detail) => void;
}) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold mb-6">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {data.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard hover className="cursor-pointer" onClick={() => onSelect(item.detail)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-black text-gray-900 dark:text-white/90">
                  NO.{String(item.order).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-gray-400">{item.label}</span>
              </div>
              <div className={`aspect-square rounded-lg mb-3 bg-gradient-to-br ${item.gradient}`} />
              <OverflowTooltip text={item.name} className="block font-semibold text-sm truncate text-gray-900 dark:text-white" />
              <OverflowTooltip text={item.meta} className="block text-xs text-gray-500 truncate" />
              <OverflowTooltip text={item.subMeta} className="block text-xs text-gray-600 truncate mt-1" />
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

