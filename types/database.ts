export type QueryResult<T> = {
  data: T[] | null;
  error: Error | null;
};

export type MaybeSingleResult<T> = {
  data: T | null;
  error: Error | null;
};

export type ProfileRow = {
  id: string;
  slug: string;
  name: string;
  intro: string;
  current_status: string;
  meta_title: string;
  meta_description: string;
  meta_author: string;
};

export type ProfileLifeRow = {
  current_city: string;
  birth_date: string;
  zodiac_sign: string;
  life_mbti: string;
  work_mbti: string;
};

export type ValueRow = {
  value: string;
  sort_order: number;
};

export type ExperienceRow = {
  city: string;
  event_date: string;
  description: string;
  sort_order: number;
};

export type SchoolRow = {
  degree: string;
  major: string;
  institution: string;
  start_date: string;
  end_date: string;
  sort_order: number;
};

export type EducationMetaRow = {
  undergraduate_major: string;
  undergraduate_advisor: string;
};

export type WorkMetaRow = {
  current_job: string;
};

export type JobRow = {
  id: string;
  company_name: string;
  position: string;
  position_type: string;
  start_date: string;
  end_date: string;
  products_responsible_for: string;
  job_summary: string;
  work_output: string;
  sort_order: number;
};

export type DevelopmentSkillRow = {
  skill_type: 'tech_stack' | 'expertise';
  value: string;
  sort_order: number;
};

export type ProjectRow = {
  id: string;
  project_name: string;
  github_url: string;
  live_url: string;
  description: string;
  start_date: string;
  end_date: string;
  report_url: string;
  sort_order: number;
};

export type ProjectListRow = {
  project_id: string;
  value: string;
  sort_order: number;
};

export type DevToolRow = {
  id: string;
  name: string;
  link: string;
  comment: string;
  sort_order: number;
};

export type DevToolTagRow = {
  dev_tool_id: string;
  value: string;
  sort_order: number;
};

export type ProductItemRow = {
  id: string;
  item_type: 'favorite_product' | 'recommended_product' | 'favorite_brand';
  name: string;
  link: string;
  intro: string;
  sort_order: number;
};

export type ProductItemTagRow = {
  product_item_id: string;
  value: string;
  sort_order: number;
};

export type HardwareItemRow = {
  category: 'phone' | 'computer' | 'tablet' | 'smartwatch' | 'headphones';
  value: string;
  sort_order: number;
};

export type CreationItemRow = {
  item_type: 'video' | 'article' | 'speech';
  series: string;
  title: string;
  link_primary: string;
  link_secondary: string;
  excerpt: string;
  outline_doc: string;
  sort_order: number;
};


export type LibraryKind = 'music' | 'film' | 'game' | 'book';
export type LibrarySubtype = 'work' | 'creator' | 'song';

export type LibraryCategoryRow = {
  id: string;
  profile_id: string;
  kind: LibraryKind;
  name: string;
  sort_order: number;
  created_at?: string;
};

export type LibraryItemRow = {
  id: string;
  profile_id: string;
  kind: LibraryKind;
  subtype: LibrarySubtype;
  category_id: string | null;
  name: string;
  creator: string;
  link: string;
  comment: string;
  image_url: string | null;
  sort_order: number;
  created_at?: string;
};

export type PerformanceRow = {
  event_type: string;
  name: string;
  event_date: string;
  genre: string;
  location: string;
  sort_order: number;
};

export type ContactMethodRow = {
  method_name: string;
  content: string;
  sort_order: number;
};

export type PlatformAccountRow = {
  platform_name: string;
  username: string;
  homepage_link: string;
  sort_order: number;
};

export type ThoughtQaRow = {
  question: string;
  answer: string;
  source: string;
  qa_date: string;
  sort_order: number;
};

export type NotificationRow = {
  notification_date: string;
  text: string;
  type: string;
  sort_order: number;
};
