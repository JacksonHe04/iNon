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
        className="relative z-40 border-b border-[var(--archive-line-strong)] bg-[rgb(var(--archive-paper-rgb)/0.96)] archive-top-nav"
      />
    </div>
  );
}
