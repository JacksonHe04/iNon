'use client';

import type { ReadmeData } from '@/types';
import BioHeaderBlock from '@/components/blocks/BioHeaderBlock';
import BookmarkBlock from '@/components/blocks/BookmarkBlock';
import AiCloneBlock from '@/components/blocks/AiCloneBlock';
import AppLauncherBlock from '@/components/blocks/AppLauncherBlock';
import MusicBlock from '@/components/blocks/MusicBlock';
import MovieBlock from '@/components/blocks/MovieBlock';
import BookBlock from '@/components/blocks/BookBlock';
import GameBlock from '@/components/blocks/GameBlock';
import TimelineBlock from '@/components/blocks/TimelineBlock';
import FriendLinkBlock from '@/components/blocks/FriendLinkBlock';

import BasicSection from '@/components/sections/BasicSection';
import LifeSection from '@/components/sections/LifeSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import EducationSection from '@/components/sections/EducationSection';
import WorkSection from '@/components/sections/WorkSection';
import DevelopmentSection from '@/components/sections/DevelopmentSection';
import ProductsSection from '@/components/sections/ProductsSection';
import CreationSection from '@/components/sections/CreationSection';
import EventsSection from '@/components/sections/EventsSection';
import TagsSection from '@/components/sections/TagsSection';
import ContactSection from '@/components/sections/ContactSection';
import MessageSection from '@/components/sections/MessageSection';
import FooterSection from '@/components/sections/FooterSection';
import DeepWaterSection from '@/components/sections/DeepWaterSection';

interface PublicBlockRendererProps {
  data: ReadmeData;
}

export default function PublicBlockRenderer({ data }: PublicBlockRendererProps) {
  const defaultBookmarks = [
    { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: '2', title: 'Vercel', url: 'https://vercel.com', icon: '▲' },
    { id: '3', title: 'Supabase', url: 'https://supabase.com', icon: '⚡' },
    { id: '4', title: 'Antigravity CLI', url: 'https://deepmind.google', icon: '🤖' },
  ];

  const musicItems = data.music.albums.map((a, i) => ({
    id: String(i),
    name: a.name,
    artist: a.artist,
    link: a.link,
    comment: a.comment,
  }));

  const movieItems = data.films.films.map((f, i) => ({
    id: String(i),
    name: f.name,
    director: f.director,
    country: f.country,
    link: f.link,
    comment: f.comment,
  }));

  const bookItems = data.reading.books.map((b, i) => ({
    id: String(i),
    name: b.name,
    author: b.author,
    country: b.country,
    link: b.link,
    comment: b.comment,
  }));

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

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. Bio Header Block */}
      <BioHeaderBlock
        name={data.basic.name}
        intro={data.basic.intro}
        currentStatus={data.basic.current_status}
        currentCity={data.life.current_city}
        mbti={data.life.mbti}
        keywords={data.basic.keywords}
      />

      {/* 2. Shortcuts & AI Block Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookmarkBlock items={defaultBookmarks} />
        <AiCloneBlock name={data.basic.name} />
      </div>

      <AppLauncherBlock />

      {/* 3. Media & Collection Non Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {musicItems.length > 0 && <MusicBlock items={musicItems} />}
        {movieItems.length > 0 && <MovieBlock items={movieItems} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookItems.length > 0 && <BookBlock items={bookItems} />}
        {friendLinks.length > 0 && <FriendLinkBlock items={friendLinks} />}
      </div>

      {timelineItems.length > 0 && <TimelineBlock items={timelineItems} />}

      {/* Detail Sections */}
      <LifeSection data={data.life} />
      <ExperienceSection data={data.experience} />
      <EducationSection data={data.education} />
      <WorkSection data={data.work} />
      <DevelopmentSection data={data.development} />
      <ProductsSection data={data.products} />
      <CreationSection data={data.creation} />
      <EventsSection data={data.events} />
      <TagsSection data={data} />
      <ContactSection data={data.contact} />
      <MessageSection />
      <FooterSection />
      <DeepWaterSection data={data.thoughts} />
    </div>
  );
}
