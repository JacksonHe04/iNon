import React from 'react';
import { ExternalLink } from 'lucide-react';
import BlockImage from '../BlockImage';

export interface VideoItem {
  series: string;
  title: string;
  video_link: string;
  podcast_link: string;
  image_url?: string;
}

interface VideoGridProps {
  videos: VideoItem[];
  colSpan?: number;
}

export function VideoGrid({ videos, colSpan = 2 }: VideoGridProps) {
  return (
    <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {videos.map((vid, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition flex flex-col justify-between"
        >
          <div>
            {vid.image_url && (
              <BlockImage
                src={vid.image_url}
                alt={vid.title}
                className="w-full aspect-square rounded-lg mb-2 object-cover"
                fallback={null}
              />
            )}
            <span className="text-[10px] text-gray-400 font-mono">{vid.series}</span>
            <h4 className="font-bold text-xs text-gray-800 dark:text-white mt-0.5">
              {vid.title}
            </h4>
          </div>
          <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
            {vid.video_link && vid.video_link.trim() !== '' && (
              <a
                href={vid.video_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>视频链接</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {vid.podcast_link && vid.podcast_link.trim() !== '' && (
              <a
                href={vid.podcast_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                <span>播客链接</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default VideoGrid;
