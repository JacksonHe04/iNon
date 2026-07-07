import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { Film, ExternalLink } from 'lucide-react';

export interface MovieItem {
  id: string;
  name: string;
  director?: string;
  country?: string;
  link?: string;
  comment?: string;
}

interface MovieBlockProps {
  items: MovieItem[];
  title?: string;
}

export default function MovieBlock({ items, title = '影视海报墙' }: MovieBlockProps) {
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);

  return (
    <GlassCard className="p-5 space-y-4 hover:border-amber-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Film className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} 部影片</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedMovie(item)}
            className="group relative p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-amber-400/50 transition flex flex-col justify-between space-y-2 cursor-pointer"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  🎬 {item.name}
                </span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-gray-400 hover:text-amber-500 rounded transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {item.director && (
                <p className="text-[11px] text-gray-500 truncate">导演: {item.director}</p>
              )}
            </div>

            {item.comment && (
              <p className="text-[10px] text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                "{item.comment}"
              </p>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!selectedMovie} onClose={() => setSelectedMovie(null)}>
        {selectedMovie && (
          <div className="space-y-3.5 text-gray-700 dark:text-gray-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedMovie.name}
            </h3>
            <p className="text-xs text-gray-400 font-medium">
              导演: {selectedMovie.director || '未知'} {selectedMovie.country ? `· ${selectedMovie.country}` : ''}
            </p>
            {selectedMovie.comment && (
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
                “ {selectedMovie.comment} ”
              </p>
            )}
            {selectedMovie.link && selectedMovie.link.trim() !== '' && (
              <a
                href={selectedMovie.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-2"
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
