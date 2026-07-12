import type {
  DevelopmentSkillRow,
  ProjectRow,
  ProjectListRow,
  DevToolRow,
  DevToolTagRow,
  ProductItemRow,
  ProductItemTagRow,
  HardwareItemRow,
  CreationItemRow,
  ValueRow,
} from '@/types/database';
import { sortByOrder, valuesByType } from './utils';

export function mapDevelopment(
  skills: DevelopmentSkillRow[],
  projects: ProjectRow[],
  projectTechStack: Map<string, ProjectListRow[]>,
  projectRoles: Map<string, ProjectListRow[]>,
  devTools: DevToolRow[],
  devToolTags: Map<string, DevToolTagRow[]>
) {
  return {
    skills: {
      tech_stack: sortByOrder(skills.filter((item) => item.skill_type === 'tech_stack')).map((item) => item.value),
      expertise: sortByOrder(skills.filter((item) => item.skill_type === 'expertise')).map((item) => item.value),
    },
    projects: projects.map((project) => ({
      project_name: project.project_name,
      github: project.github_url,
      link: project.live_url,
      description: project.description,
      tech_stack: sortByOrder(projectTechStack.get(project.id) ?? []).map((item) => item.value),
      role: sortByOrder(projectRoles.get(project.id) ?? []).map((item) => item.value),
      start_date: project.start_date,
      end_date: project.end_date,
      report_link: project.report_url,
    })),
    dev_tools: sortByOrder(devTools).map((tool) => ({
      name: tool.name,
      link: tool.link,
      comment: tool.comment,
      tags: sortByOrder(devToolTags.get(tool.id) ?? []).map((item) => item.value),
    })),
  };
}

export function mapProducts(productItems: ProductItemRow[], productItemTags: Map<string, ProductItemTagRow[]>, hardwareItems: HardwareItemRow[]) {
  const hardwareValue = (category: HardwareItemRow['category']) =>
    hardwareItems.filter((item) => item.category === category).map((item) => item.value);

  return {
    favorite_products: productItems
      .filter((item) => item.item_type === 'favorite_product')
      .map((item) => ({
        name: item.name,
        link: item.link,
        intro: item.intro,
        tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
      })),
    recommended_products: productItems
      .filter((item) => item.item_type === 'recommended_product')
      .map((item) => ({
        name: item.name,
        link: item.link,
        intro: item.intro,
        tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
      })),
    my_hardware: {
      phone: hardwareValue('phone')[0] ?? '',
      computer: hardwareValue('computer')[0] ?? '',
      tablet: hardwareValue('tablet')[0] ?? '',
      smartwatch: hardwareValue('smartwatch')[0] ?? '',
      headphones: hardwareValue('headphones'),
    },
    favorite_brands: productItems
      .filter((item) => item.item_type === 'favorite_brand')
      .map((item) => ({
        name: item.name,
        link: item.link,
        intro: item.intro,
        tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
      })),
  };
}

export function mapCreation(creationItems: CreationItemRow[], listItems: (ValueRow & { list_type: string })[]) {
  return {
    videos: creationItems
      .filter((item) => item.item_type === 'video')
      .map((item) => ({
        series: item.series,
        title: item.title,
        video_link: item.link_primary,
        podcast_link: item.link_secondary,
      })),
    articles: creationItems
      .filter((item) => item.item_type === 'article')
      .map((item) => ({
        title: item.title,
        link: item.link_primary,
        excerpt: item.excerpt,
      })),
    speeches: creationItems
      .filter((item) => item.item_type === 'speech')
      .map((item) => ({
        speech_name: item.title,
        link: item.link_primary,
        outline_doc: item.outline_doc,
        presentation_link: item.link_secondary,
      })),
    mottos: valuesByType(listItems, 'motto'),
    quotes: valuesByType(listItems, 'quote'),
  };
}
