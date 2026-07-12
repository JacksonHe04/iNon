import React from 'react';
import { ExternalLink } from 'lucide-react';
import BlockImage from '../BlockImage';

export interface ArticleItem {
  title: string;
  link: string;
  excerpt: string;
  image_url?: string;
}

interface ArticleGridProps {
  articles: ArticleItem[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <div className="space-y-3">
      {articles.map((art, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-purple-400/30 transition space-y-1.5"
        >
          {art.image_url && (
            <BlockImage
              src={art.image_url}
              alt={art.title}
              className="w-full aspect-square rounded-lg mb-2 object-cover"
              fallback={null}
            />
          )}
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-bold text-xs text-gray-800 dark:text-white leading-tight">
              {art.title}
            </h4>
            {art.link && art.link.trim() !== '' && (
              <a
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 flex-shrink-0 font-medium"
              >
                <span>阅读</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{art.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
export default ArticleGrid;
