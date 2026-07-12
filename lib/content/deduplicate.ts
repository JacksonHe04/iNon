import type { ReadmeData } from '@/types';

function deduplicateArray<T>(arr: T[] | undefined): T[] {
  if (!arr || !Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of arr) {
    const key = typeof item === 'object' && item !== null
      ? JSON.stringify(Object.keys(item).sort().reduce((obj: any, k) => {
          obj[k] = (item as any)[k];
          return obj;
        }, {}))
      : String(item);

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export function deduplicateReadmeData(data: ReadmeData): ReadmeData {
  const clone = JSON.parse(JSON.stringify(data)) as ReadmeData;

  // 1. basic
  if (clone.basic) {
    if (clone.basic.tags) {
      clone.basic.tags = deduplicateArray(clone.basic.tags);
    }
    if (clone.basic.keywords) {
      clone.basic.keywords = deduplicateArray(clone.basic.keywords);
    }
    if (clone.basic.values) {
      clone.basic.values = deduplicateArray(clone.basic.values);
    }
  }

  // 2. experience
  if (clone.experience && clone.experience.experience) {
    clone.experience.experience = deduplicateArray(clone.experience.experience);
  }

  // 3. education
  if (clone.education && clone.education.schools) {
    clone.education.schools = deduplicateArray(clone.education.schools);
  }

  // 4. work
  if (clone.work) {
    if (clone.work.jobs) {
      clone.work.jobs = deduplicateArray(clone.work.jobs);
    }
    if (clone.work.work_preferences) {
      clone.work.work_preferences = deduplicateArray(clone.work.work_preferences);
    }
  }

  // 5. development
  if (clone.development) {
    if (clone.development.skills) {
      if (clone.development.skills.tech_stack) {
        clone.development.skills.tech_stack = deduplicateArray(clone.development.skills.tech_stack);
      }
      if (clone.development.skills.expertise) {
        clone.development.skills.expertise = deduplicateArray(clone.development.skills.expertise);
      }
    }
    if (clone.development.projects) {
      clone.development.projects = deduplicateArray(clone.development.projects);
    }
    if (clone.development.dev_tools) {
      clone.development.dev_tools = deduplicateArray(clone.development.dev_tools);
    }
  }

  // 6. products
  if (clone.products) {
    if (clone.products.favorite_products) {
      clone.products.favorite_products = deduplicateArray(clone.products.favorite_products);
    }
    if (clone.products.recommended_products) {
      clone.products.recommended_products = deduplicateArray(clone.products.recommended_products);
    }
    if (clone.products.favorite_brands) {
      clone.products.favorite_brands = deduplicateArray(clone.products.favorite_brands);
    }
    if (clone.products.my_hardware?.headphones) {
      clone.products.my_hardware.headphones = deduplicateArray(clone.products.my_hardware.headphones);
    }
  }

  // 7. creation
  if (clone.creation) {
    if (clone.creation.videos) {
      clone.creation.videos = deduplicateArray(clone.creation.videos);
    }
    if (clone.creation.articles) {
      clone.creation.articles = deduplicateArray(clone.creation.articles);
    }
    if (clone.creation.speeches) {
      clone.creation.speeches = deduplicateArray(clone.creation.speeches);
    }
    if (clone.creation.mottos) {
      clone.creation.mottos = deduplicateArray(clone.creation.mottos);
    }
    if (clone.creation.quotes) {
      clone.creation.quotes = deduplicateArray(clone.creation.quotes);
    }
  }

  // 8. library
  if (clone.library) {
    const kinds: ('music' | 'film' | 'game' | 'book')[] = ['music', 'film', 'game', 'book'];
    for (const kind of kinds) {
      const section = clone.library[kind];
      if (section) {
        if (section.categories) {
          section.categories = deduplicateArray(section.categories);
        }
        if (section.works) {
          section.works = deduplicateArray(section.works);
        }
        if (section.creators) {
          section.creators = deduplicateArray(section.creators);
        }
        if (kind === 'music' && (section as any).songs) {
          (section as any).songs = deduplicateArray((section as any).songs);
        }
      }
    }
  }

  // 9. events
  if (clone.events && clone.events.performances) {
    clone.events.performances = deduplicateArray(clone.events.performances);
  }

  // 10. contact
  if (clone.contact) {
    if (clone.contact.contact_info) {
      clone.contact.contact_info = deduplicateArray(clone.contact.contact_info);
    }
    if (clone.contact.platform_accounts) {
      clone.contact.platform_accounts = deduplicateArray(clone.contact.platform_accounts);
    }
  }

  // 11. thoughts
  if (clone.thoughts) {
    if (clone.thoughts.personal_philosophy) {
      clone.thoughts.personal_philosophy = deduplicateArray(clone.thoughts.personal_philosophy);
    }
    if (clone.thoughts.industry_views) {
      clone.thoughts.industry_views = deduplicateArray(clone.thoughts.industry_views);
    }
    if (clone.thoughts.ideology) {
      clone.thoughts.ideology = deduplicateArray(clone.thoughts.ideology);
    }
    if (clone.thoughts.life_elements) {
      clone.thoughts.life_elements = deduplicateArray(clone.thoughts.life_elements);
    }
    if (clone.thoughts.macro_vision) {
      clone.thoughts.macro_vision = deduplicateArray(clone.thoughts.macro_vision);
    }
    if (clone.thoughts.personal_vision) {
      clone.thoughts.personal_vision = deduplicateArray(clone.thoughts.personal_vision);
    }
    if (clone.thoughts.qa) {
      clone.thoughts.qa = deduplicateArray(clone.thoughts.qa);
    }
  }

  // 12. notifications
  if (clone.notifications) {
    clone.notifications = deduplicateArray(clone.notifications);
  }

  return clone;
}
