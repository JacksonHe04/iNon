import type { ReadmeData } from '@/types';
import type { BlockConfig } from '@/types/layout';
import TopNav from '@/components/TopNav';

interface HeaderNavProps {
  data: ReadmeData;
  username?: string;
  blocks?: BlockConfig[];
}

export default function HeaderNav({ data, username, blocks }: HeaderNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <TopNav
        data={data}
        blocks={blocks}
        className="relative z-40 bg-white/20 border-b border-white/30 backdrop-blur-[40px]"
      />
    </div>
  );
}
