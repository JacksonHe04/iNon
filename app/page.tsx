import { getReadmeData } from '@/lib/content';
import ShellLayout from '@/components/layout/ShellLayout';
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

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getReadmeData('');

  return (
    <ShellLayout data={data} username={data.basic.name || ''} showSideNav={true}>
      <BasicSection data={data.basic} />
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
    </ShellLayout>
  );
}
