import React from 'react';
import { GithubIcon, TwitterIcon } from '@/components/icons/PlatformIcons';
import type { ReadmeData } from '@/types';

interface SocialLinksProps {
  platformAccounts: ReadmeData['contact']['platform_accounts'];
}

const platformIconMap = {
  GitHub: GithubIcon,
  Twitter: TwitterIcon,
} as const;

export function SocialLinks({ platformAccounts }: SocialLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-2">
      {platformAccounts.map((platform) => {
        const Icon = platformIconMap[platform.platform_name as keyof typeof platformIconMap];
        return (
          <a
            key={platform.platform_name}
            href={platform.homepage_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 transition hover:border-purple-200 hover:text-purple-600"
          >
            {Icon ? (
              <Icon className="h-4 w-4" />
            ) : (
              <span className="text-xs font-semibold">
                {platform.platform_name.slice(0, 1)}
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
export default SocialLinks;
