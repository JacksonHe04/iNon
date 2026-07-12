// 类型定义文件
export interface ReadmeData {
  meta: {
    title: string;
    description: string;
    author: string;
  };
  basic: {
    name: string;
    intro: string;
    current_status: string;
    keywords: string[];
    values: string[];
    tags: string[];
  };
  life: {
    current_city: string;
    mbti: {
      life_mbti: string;
      work_mbti: string;
    };
    birth_date: string;
    zodiac_sign: string;
    habits: string[];
    diet: {
      favorite_food: string[];
      favorite_drinks: string[];
    };
  };
  experience: {
    experience: Array<{
      city: string;
      date: string;
      description: string;
    }>;
  };
  education: {
    schools: Array<{
      degree: string;
      major: string;
      institution: string;
      start_date: string;
      end_date: string;
    }>;
    undergraduate_major: string;
    undergraduate_advisor: string;
  };
  work: {
    current_job: string;
    jobs: Array<{
      company_name: string;
      position: string;
      position_type: string;
      start_date: string;
      end_date: string;
      products_responsible_for: string;
      job_summary: string;
      work_output: string;
    }>;
    work_preferences: string[];
  };
  development: {
    skills: {
      tech_stack: string[];
      expertise: string[];
    };
    projects: Array<{
      project_name: string;
      github: string;
      link: string;
      description: string;
      tech_stack: string[];
      role: string[];
      start_date: string;
      end_date: string;
      report_link?: string;
    }>;
    dev_tools: Array<{
      name: string;
      link: string;
      comment: string;
      tags: string[];
    }>;
  };
  products: {
    favorite_products: Array<{
      name: string;
      link: string;
      intro: string;
      tags: string[];
      image_url?: string;
    }>;
    recommended_products: Array<{
      name: string;
      link: string;
      intro: string;
      tags: string[];
      image_url?: string;
    }>;
    my_hardware: {
      phone: string;
      computer: string;
      tablet: string;
      smartwatch: string;
      headphones: string[];
    };
    favorite_brands: Array<{
      name: string;
      link: string;
      intro: string;
      tags: string[];
      image_url?: string;
    }>;
  };
  creation: {
    videos: Array<{
      series: string;
      title: string;
      video_link: string;
      podcast_link: string;
      image_url?: string;
    }>;
    articles: Array<{
      title: string;
      link: string;
      excerpt: string;
      image_url?: string;
    }>;
    speeches: Array<{
      speech_name: string;
      link: string;
      outline_doc: string;
      presentation_link: string;
      image_url?: string;
    }>;
    mottos: string[];
    quotes: string[];
  };
  reading: {
    books: Array<{
      name: string;
      author: string;
      country: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    authors: Array<{
      name: string;
      country: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
  };
  films: {
    films: Array<{
      name: string;
      director: string;
      country: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    directors: Array<{
      name: string;
      country: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
  };
  music: {
    albums: Array<{
      name: string;
      artist: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    songs: Array<{
      name: string;
      artist: string;
      album: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    musicians: Array<{
      name: string;
      region: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
  };
  hiphop: {
    albums: Array<{
      name: string;
      artist: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    songs: Array<{
      name: string;
      artist: string;
      album: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
    musicians: Array<{
      name: string;
      region: string;
      link: string;
      comment: string;
      image_url?: string;
    }>;
  };
  events: {
    performances: Array<{
      type: string;
      name: string;
      date: string;
      genre: string;
      location: string;
    }>;
  };
  contact: {
    contact_info: Array<{
      method_name: string;
      content: string;
    }>;
    platform_accounts: Array<{
      platform_name: string;
      username: string;
      homepage_link: string;
    }>;
  };
  thoughts: {
    personal_philosophy: string[];
    industry_views: string[];
    ideology: string[];
    life_elements: string[];
    macro_vision: string[];
    personal_vision: string[];
    qa: Array<{
      question: string;
      answer: string;
      source: string;
      date: string;
    }>;
  };
  notifications: Array<{
    date: string;
    text: string;
    type: string;
  }>;
  messages: Array<{
    id: string;
    nickname: string;
    content: string;
    created_at: string;
  }>;
}

