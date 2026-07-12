import type {
  ProfileRow,
  ValueRow,
  ExperienceRow,
  SchoolRow,
  EducationMetaRow,
  WorkMetaRow,
  JobRow,
} from '@/types/database';
import { sortByOrder, valuesByType, withFallback } from './utils';

export function mapProfileAndBasic(profile: ProfileRow, tags: (ValueRow & { tag_type: string })[]) {
  return {
    meta: {
      title: profile.meta_title,
      description: profile.meta_description,
      author: profile.meta_author,
    },
    basic: {
      name: profile.name,
      intro: profile.intro,
      current_status: profile.current_status,
      keywords: valuesByType(tags, 'keyword'),
      values: valuesByType(tags, 'value'),
      tags: valuesByType(tags, 'tag'),
    },
  };
}

export function mapLife(lifeData: any, listItems: (ValueRow & { list_type: string })[]) {
  return {
    current_city: withFallback(lifeData?.current_city),
    mbti: {
      life_mbti: withFallback(lifeData?.life_mbti),
      work_mbti: withFallback(lifeData?.work_mbti),
    },
    birth_date: withFallback(lifeData?.birth_date),
    zodiac_sign: withFallback(lifeData?.zodiac_sign),
    habits: valuesByType(listItems, 'habit'),
    diet: {
      favorite_food: valuesByType(listItems, 'favorite_food'),
      favorite_drinks: valuesByType(listItems, 'favorite_drink'),
    },
  };
}

export function mapExperience(experiences: ExperienceRow[]) {
  return {
    experience: sortByOrder(experiences).map((item) => ({
      city: item.city,
      date: item.event_date,
      description: item.description,
    })),
  };
}

export function mapEducation(schools: SchoolRow[], meta: EducationMetaRow | null) {
  return {
    schools: sortByOrder(schools).map((item) => ({
      degree: item.degree,
      major: item.major,
      institution: item.institution,
      start_date: item.start_date,
      end_date: item.end_date,
    })),
    undergraduate_major: withFallback(meta?.undergraduate_major),
    undergraduate_advisor: withFallback(meta?.undergraduate_advisor),
  };
}

export function mapWork(jobs: JobRow[], meta: WorkMetaRow | null, listItems: (ValueRow & { list_type: string })[]) {
  return {
    current_job: withFallback(meta?.current_job),
    jobs: sortByOrder(jobs).map((item) => ({
      company_name: item.company_name,
      position: item.position,
      position_type: item.position_type,
      start_date: item.start_date,
      end_date: item.end_date,
      products_responsible_for: item.products_responsible_for,
      job_summary: item.job_summary,
      work_output: item.work_output,
    })),
    work_preferences: valuesByType(listItems, 'work_preference'),
  };
}
