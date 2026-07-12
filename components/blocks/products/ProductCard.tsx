import React from 'react';
import BlockImage from '../BlockImage';

interface ProductCardProps {
  name: string;
  intro: string;
  tags: string[];
  image_url?: string;
  onClick: () => void;
}

export function ProductCard({ name, intro, tags, image_url, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-3.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-amber-400/40 transition cursor-pointer flex flex-col justify-between"
    >
      <div>
        {image_url && (
          <BlockImage
            src={image_url}
            alt={name}
            className="w-full aspect-square rounded-lg mb-2 object-cover"
            fallback={null}
          />
        )}
        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{name}</h4>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{intro}</p>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-600 dark:text-amber-400 font-mono"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
export default ProductCard;
