'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { Music, Disc, Play, Disc2, ExternalLink } from 'lucide-react';
import BlockImage from './BlockImage';

export interface MusicAlbum {
  name: string;
  artist: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface MusicSong {
  name: string;
  artist: string;
  album: string;
  link: string;
  comment: string;
  image_url?: string;
}

export interface MusicMusician {
  name: string;
  region: string;
  link: string;
  comment: string;
  image_url?: string;
}

interface MusicBlockProps {
  albums?: MusicAlbum[];
  songs?: MusicSong[];
  musicians?: MusicMusician[];
  title?: string;
  colSpan?: number;
}

type SelectedDetail = {
  title: string;
  subTitle: string;
  comment: string;
  link?: string;
};

export default function MusicBlock({
  albums = [],
  songs = [],
  musicians = [],
  title = '音乐收藏卡片',
  colSpan = 2,
}: MusicBlockProps) {
  const [activeTab, setActiveTab] = useState<'albums' | 'songs' | 'musicians'>('albums');
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail | null>(null);

  const getGradient = (idx: number) => {
    const gradients = [
      'from-emerald-400 to-teal-400',
      'from-green-400 to-emerald-400',
      'from-teal-400 to-cyan-400',
      'from-cyan-400 to-blue-400',
      'from-blue-400 to-indigo-400',
    ];
    return gradients[idx % gradients.length];
  };

  return (
    <GlassCard className="p-5 space-y-5 hover:border-emerald-400/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Music className="w-5 h-5" />
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
            { id: 'albums', label: '专辑', count: albums.length },
            { id: 'songs', label: '单曲', count: songs.length },
            { id: 'musicians', label: '音乐人', count: musicians.length },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
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
        {activeTab === 'albums' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {albums.map((album, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: album.name,
                    subTitle: `${album.artist} · 专辑`,
                    comment: album.comment,
                    link: album.link,
                  })
                }
                className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-emerald-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    <Disc className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <BlockImage
                    src={album.image_url}
                    alt={album.name}
                    fallback={
                      <div className={`aspect-video rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {album.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'songs' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {songs.map((song, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: song.name,
                    subTitle: `${song.artist} · 单曲`,
                    comment: song.comment || `收录于专辑《${song.album}》`,
                    link: song.link,
                  })
                }
                className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-emerald-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    <Play className="w-3 h-3 text-emerald-500" />
                  </div>
                  <BlockImage
                    src={song.image_url}
                    alt={song.name}
                    fallback={
                      <div className={`aspect-video rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx + 2)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {song.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {song.artist} · {song.album}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'musicians' && (
          <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {musicians.map((mus, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: mus.name,
                    subTitle: `${mus.region} · 音乐人`,
                    comment: mus.comment,
                    link: mus.link,
                  })
                }
                className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-emerald-400/40 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    <Disc2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <BlockImage
                    src={mus.image_url}
                    alt={mus.name}
                    fallback={
                      <div className={`aspect-video rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx + 4)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {mus.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{mus.region}</p>
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
                className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
              >
                <span>听歌/了解更多</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
