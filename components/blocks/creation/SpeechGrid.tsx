import React from 'react';
import BlockImage from '../BlockImage';

export interface SpeechItem {
  speech_name: string;
  link: string;
  outline_doc: string;
  presentation_link: string;
  image_url?: string;
}

interface SpeechGridProps {
  speeches: SpeechItem[];
}

export function SpeechGrid({ speeches }: SpeechGridProps) {
  return (
    <div className="space-y-3">
      {speeches.map((sp, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition flex flex-col gap-3"
        >
          {sp.image_url && (
            <BlockImage
              src={sp.image_url}
              alt={sp.speech_name}
              className="w-full aspect-square rounded-lg object-cover"
              fallback={null}
            />
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="font-bold text-xs text-gray-800 dark:text-white leading-tight">
              🎤 {sp.speech_name}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {sp.link && sp.link.trim() !== '' && (
                <a
                  href={sp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] bg-purple-500/10 px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>演示文稿</span>
                </a>
              )}
              {sp.outline_doc && sp.outline_doc.trim() !== '' && (
                <a
                  href={sp.outline_doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] bg-pink-500/10 px-2 py-0.5 rounded text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>大纲文档</span>
                </a>
              )}
              {sp.presentation_link && sp.presentation_link.trim() !== '' && (
                <a
                  href={sp.presentation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>讲稿</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default SpeechGrid;
