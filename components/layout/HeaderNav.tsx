'use client';

import type { ReadmeData } from '@/types';
import TopNav from '@/components/TopNav';

interface HeaderNavProps {
  data: ReadmeData;
  username?: string;
}

export default function HeaderNav({ data }: HeaderNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <TopNav data={data} className="relative bg-white/20 border-b border-white/30 backdrop-blur-[40px]" />
    </div>
  );
}
