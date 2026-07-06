'use client';

import type { ReadmeData } from '@/types';
import BasicSection from '@/components/sections/BasicSection';
import LifeSection from '@/components/sections/LifeSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import EducationSection from '@/components/sections/EducationSection';
import WorkSection from '@/components/sections/WorkSection';
import DevelopmentSection from '@/components/sections/DevelopmentSection';
import ProductsSection from '@/components/sections/ProductsSection';
import ReadingSection from '@/components/sections/ReadingSection';
import FilmsSection from '@/components/sections/FilmsSection';
import CreationSection from '@/components/sections/CreationSection';
import MusicSection from '@/components/sections/MusicSection';
import HiphopSection from '@/components/sections/HiphopSection';
import EventsSection from '@/components/sections/EventsSection';
import TagsSection from '@/components/sections/TagsSection';
import ContactSection from '@/components/sections/ContactSection';
import MessageSection from '@/components/sections/MessageSection';
import FooterSection from '@/components/sections/FooterSection';
import DeepWaterSection from '@/components/sections/DeepWaterSection';
import BookmarkBlock from '@/components/blocks/BookmarkBlock';
import AiCloneBlock from '@/components/blocks/AiCloneBlock';
import AppLauncherBlock from '@/components/blocks/AppLauncherBlock';

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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero / Basic Section */}
      <BasicSection data={data.basic} />

      {/* Non Block Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BookmarkBlock items={defaultBookmarks} />
        <AiCloneBlock name={data.basic.name} />
      </div>

      <AppLauncherBlock />

      {/* Content & Media Sections */}
      <LifeSection data={data.life} />
      <ExperienceSection data={data.experience} />
      <EducationSection data={data.education} />
      <WorkSection data={data.work} />
      <DevelopmentSection data={data.development} />
      <ProductsSection data={data.products} />
      <ReadingSection data={data.reading} />
      <FilmsSection data={data.films} />
      <CreationSection data={data.creation} />
      <MusicSection data={data.music} />
      <HiphopSection data={data.hiphop} />
      <EventsSection data={data.events} />
      <TagsSection data={data} />
      <ContactSection data={data.contact} />
      <MessageSection />
      <FooterSection />
      <DeepWaterSection data={data.thoughts} />
    </div>
  );
}
