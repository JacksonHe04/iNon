import React from 'react';
import type { ReadmeData } from '@/types';
import type { BlockConfig } from '@/types/layout';
import BioHeaderBlock from '@/components/blocks/BioHeaderBlock';
import BookmarkBlock from '@/components/blocks/BookmarkBlock';
import AiCloneBlock from '@/components/blocks/AiCloneBlock';
import AppLauncherBlock from '@/components/blocks/AppLauncherBlock';
import ProjectBlock from '@/components/blocks/ProjectBlock';
import MusicBlock from '@/components/blocks/MusicBlock';
import MovieBlock from '@/components/blocks/MovieBlock';
import BookBlock from '@/components/blocks/BookBlock';
import GameBlock from '@/components/blocks/GameBlock';
import TimelineBlock from '@/components/blocks/TimelineBlock';
import FriendLinkBlock from '@/components/blocks/FriendLinkBlock';
import ContactBlock from '@/components/blocks/ContactBlock';
import EducationBlock from '@/components/blocks/EducationBlock';
import WorkBlock from '@/components/blocks/WorkBlock';
import ProductsBlock from '@/components/blocks/ProductsBlock';
import CreationBlock from '@/components/blocks/CreationBlock';
import HiphopBlock from '@/components/blocks/HiphopBlock';
import EventsBlock from '@/components/blocks/EventsBlock';
import TagsBlock from '@/components/blocks/TagsBlock';
import SkillsBlock from '@/components/blocks/SkillsBlock';
import DevToolsBlock from '@/components/blocks/DevToolsBlock';
import { getBlockTitle } from '@/lib/blocks/registry';

interface BlockRendererProps {
  block: BlockConfig;
  data: ReadmeData;
}

const defaultBookmarks = [
  { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
  { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
  { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
];

export function BlockRenderer({ block, data }: BlockRendererProps) {
  const title = getBlockTitle(block.blockType);

  const timelineItems = data.experience.experience.map((e, i) => ({
    id: String(i),
    date: e.date,
    city: e.city,
    description: e.description,
  }));

  const friendLinks = (data.contact.platform_accounts || []).map((acc, i) => ({
    id: String(i),
    name: acc.platform_name,
    link: acc.homepage_link,
  }));

  switch (block.blockType) {
    case 'bio':
      return (
        <BioHeaderBlock
          name={data.basic.name}
          intro={data.basic.intro}
          currentStatus={data.basic.current_status}
          currentCity={data.life.current_city}
          mbti={data.life.mbti}
          keywords={data.basic.keywords}
        />
      );
    case 'bookmarks':
      return <BookmarkBlock items={defaultBookmarks} title={title} />;
    case 'ai_clone':
      return <AiCloneBlock name={data.basic.name} title={title} />;
    case 'app_launcher':
      return <AppLauncherBlock title={title} />;
    case 'projects':
      return <ProjectBlock projects={data.development.projects} title={title} />;
    case 'timeline':
      return <TimelineBlock items={timelineItems} title={title} />;
    case 'music':
      return (
        <MusicBlock
          albums={data.music.albums}
          songs={data.music.songs}
          musicians={data.music.musicians}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'movies':
      return (
        <MovieBlock
          films={data.films.films}
          directors={data.films.directors}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'books':
      return (
        <BookBlock
          books={data.reading.books}
          authors={data.reading.authors}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'friend_links':
      return <FriendLinkBlock items={friendLinks} title={title} />;
    case 'contact':
      return <ContactBlock contactInfo={data.contact.contact_info} title={title} />;
    case 'education':
      return (
        <EducationBlock
          schools={data.education.schools}
          undergraduateMajor={data.education.undergraduate_major}
          undergraduateAdvisor={data.education.undergraduate_advisor}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'work':
      return (
        <WorkBlock
          currentJob={data.work.current_job}
          jobs={data.work.jobs}
          workPreferences={data.work.work_preferences}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'products':
      return (
        <ProductsBlock
          favoriteProducts={data.products.favorite_products}
          recommendedProducts={data.products.recommended_products}
          myHardware={data.products.my_hardware}
          favoriteBrands={data.products.favorite_brands}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'creation':
      return (
        <CreationBlock
          videos={data.creation.videos}
          articles={data.creation.articles}
          speeches={data.creation.speeches}
          mottos={data.creation.mottos}
          quotes={data.creation.quotes}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'hiphop':
      return (
        <HiphopBlock
          albums={data.hiphop.albums}
          songs={data.hiphop.songs}
          musicians={data.hiphop.musicians}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'events':
      return (
        <EventsBlock
          performances={data.events.performances}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'tags':
      return (
        <TagsBlock
          keywords={data.basic.keywords}
          values={data.basic.values}
          tags={data.basic.tags}
          habits={data.life.habits}
          workPreferences={data.work.work_preferences}
          techStack={data.development.skills.tech_stack}
          expertise={data.development.skills.expertise}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'skills':
      return (
        <SkillsBlock
          techStack={data.development.skills.tech_stack}
          expertise={data.development.skills.expertise}
          title={title}
          colSpan={block.colSpan}
        />
      );
    case 'dev_tools':
      return (
        <DevToolsBlock
          devTools={data.development.dev_tools}
          title={title}
          colSpan={block.colSpan}
        />
      );
    default:
      return null;
  }
}
export default BlockRenderer;
