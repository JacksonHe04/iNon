import { ReadmeData } from '@/types';

function joinList(items: string[], separator = ', '): string {
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(separator) : '未填写';
}

function joinMapped<T>(items: T[], mapper: (item: T) => string, separator = '; '): string {
  const cleaned = items.map(mapper).map((item) => item.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(separator) : '未填写';
}

export function readmeDataToMarkdown(data: ReadmeData): string {
  const lines: string[] = [];

  lines.push(`# ${data.meta.title}`);
  lines.push(`_${data.meta.description}_`, ``);
  lines.push(`## 基础信息`);
  lines.push(`- 姓名：${data.basic.name}`);
  lines.push(`- 简介：${data.basic.intro}`);
  lines.push(`- 当前状态：${data.basic.current_status}`);
  lines.push(`- 关键词：${joinList(data.basic.keywords)}`);
  lines.push(`- 价值观：${joinList(data.basic.values)}`);
  lines.push(`- 标签：${joinList(data.basic.tags)}`, ``);

  lines.push(`## 生活`);
  lines.push(`- 城市：${data.life.current_city}`);
  lines.push(`- MBTI：生活 ${data.life.mbti.life_mbti} / 工作 ${data.life.mbti.work_mbti}`);
  lines.push(`- 生日：${data.life.birth_date}`);
  lines.push(`- 星座：${data.life.zodiac_sign || '未填写'}`);
  lines.push(`- 习惯：${joinList(data.life.habits)}`);
  lines.push(`- 饮食：最爱食物 ${joinList(data.life.diet.favorite_food)}；最爱饮品 ${joinList(data.life.diet.favorite_drinks)}`, ``);

  lines.push(`## 经历`);
  data.experience.experience.forEach((exp) => {
    lines.push(`- ${exp.city} (${exp.date})：${exp.description}`);
  });
  lines.push('');

  lines.push(`## 教育`);
  data.education.schools.forEach((school) => {
    lines.push(`- ${school.institution}：${school.degree} · ${school.major} (${school.start_date} - ${school.end_date})`);
  });
  lines.push(`- 本科专业：${data.education.undergraduate_major}`);
  lines.push(`- 本科导师：${data.education.undergraduate_advisor || '未填写'}`, ``);

  lines.push(`## 工作`);
  lines.push(`- 当前身份：${data.work.current_job}`);
  data.work.jobs.forEach((job) => {
    lines.push(`- ${job.company_name || '未填写'}：${job.position}（${job.position_type}，${job.start_date} - ${job.end_date}）`);
    lines.push(`  - 负责产品：${job.products_responsible_for || '未填写'}`);
    lines.push(`  - 总结：${job.job_summary || '未填写'}`);
    lines.push(`  - 产出：${job.work_output || '未填写'}`);
  });
  lines.push(`- 工作偏好：${joinList(data.work.work_preferences)}`, ``);

  lines.push(`## 开发与项目`);
  lines.push(`- 技术栈：${joinList(data.development.skills.tech_stack)}`);
  lines.push(`- 专长：${joinList(data.development.skills.expertise)}`);
  data.development.projects.forEach((project) => {
    lines.push(`- ${project.project_name} (${project.start_date} - ${project.end_date})：${project.description}`);
    lines.push(`  - 技术：${joinList(project.tech_stack)}；角色：${joinList(project.role)}`);
    if (project.link) lines.push(`  - 链接：${project.link}`);
    if (project.github) lines.push(`  - GitHub：${project.github}`);
  });
  lines.push('');

  lines.push(`## 产品与设备`);
  lines.push(`- 最爱产品：${joinMapped(data.products.favorite_products, (p) => `${p.name}(${p.intro})`)}`);
  lines.push(`- 推荐产品：${joinMapped(data.products.recommended_products, (p) => `${p.name}(${p.intro})`)}`);
  lines.push(`- 设备：手机 ${data.products.my_hardware.phone}，电脑 ${data.products.my_hardware.computer}，平板 ${data.products.my_hardware.tablet}，手表 ${data.products.my_hardware.smartwatch}，耳机 ${joinList(data.products.my_hardware.headphones)}`, ``);

  lines.push(`## 创作`);
  lines.push(`- 视频：${joinMapped(data.creation.videos, (v) => `${v.series} - ${v.title}`)}`);
  lines.push(`- 文章：${joinMapped(data.creation.articles, (a) => `${a.title}`)}`);
  lines.push(`- 演讲：${joinMapped(data.creation.speeches, (s) => `${s.speech_name}`)}`);
  lines.push(`- 座右铭：${joinList(data.creation.mottos, ' / ')}`);
  lines.push(`- 语录：${joinList(data.creation.quotes, ' / ')}`, ``);

  lines.push(`## 库 (Library)`);
  if (data.library.book.works.length > 0 || data.library.book.creators.length > 0) {
    lines.push(`### 读书`);
    if (data.library.book.works.length > 0) {
      lines.push(`- 书籍：${joinMapped(data.library.book.works, (b) => `${b.name} - ${b.creator}`)}`);
    }
    if (data.library.book.creators.length > 0) {
      lines.push(`- 作家/学者：${joinMapped(data.library.book.creators, (a) => `${a.name}`, ', ')}`);
    }
  }
  if (data.library.film.works.length > 0 || data.library.film.creators.length > 0) {
    lines.push(`### 影视`);
    if (data.library.film.works.length > 0) {
      lines.push(`- 影片：${joinMapped(data.library.film.works, (f) => `${f.name} - ${f.creator}`)}`);
    }
    if (data.library.film.creators.length > 0) {
      lines.push(`- 导演/影人：${joinMapped(data.library.film.creators, (d) => `${d.name}`, ', ')}`);
    }
  }
  if (data.library.music.works.length > 0 || data.library.music.songs.length > 0 || data.library.music.creators.length > 0) {
    lines.push(`### 音乐`);
    if (data.library.music.works.length > 0) {
      lines.push(`- 专辑：${joinMapped(data.library.music.works, (a) => `${a.name} - ${a.creator}`)}`);
    }
    if (data.library.music.songs.length > 0) {
      lines.push(`- 单曲：${joinMapped(data.library.music.songs, (s) => `${s.name} - ${s.creator}`)}`);
    }
    if (data.library.music.creators.length > 0) {
      lines.push(`- 音乐人：${joinMapped(data.library.music.creators, (m) => `${m.name}`, ', ')}`);
    }
  }
  if (data.library.game.works.length > 0 || data.library.game.creators.length > 0) {
    lines.push(`### 游戏`);
    if (data.library.game.works.length > 0) {
      lines.push(`- 游戏：${joinMapped(data.library.game.works, (g) => `${g.name} - ${g.creator}`)}`);
    }
    if (data.library.game.creators.length > 0) {
      lines.push(`- 开发商/制作人：${joinMapped(data.library.game.creators, (d) => `${d.name}`, ', ')}`);
    }
  }
  lines.push(``);

  lines.push(`## 活动`);
  data.events.performances.forEach((event) => {
    lines.push(`- ${event.type}：${event.name} (${event.date}, ${event.location})`);
  });
  lines.push('');

  lines.push(`## 联系与平台`);
  lines.push(`- 联系方式：${joinMapped(data.contact.contact_info, (info) => `${info.method_name}:${info.content}`)}`);
  lines.push(`- 平台账号：${joinMapped(data.contact.platform_accounts, (p) => `${p.platform_name}:${p.username}`)}`, ``);

  lines.push(`## 思想`);
  lines.push(`- 个人哲学：${joinList(data.thoughts.personal_philosophy, ' / ')}`);
  lines.push(`- 行业观点：${joinList(data.thoughts.industry_views, ' / ')}`);
  lines.push(`- 意识形态：${joinList(data.thoughts.ideology, ' / ')}`);
  lines.push(`- 生命元素：${joinList(data.thoughts.life_elements)}`);
  lines.push(`- 宏观愿景：${joinList(data.thoughts.macro_vision, ' / ')}`);
  lines.push(`- 个人愿景：${joinList(data.thoughts.personal_vision, ' / ')}`);
  lines.push(
    `- 问答：${joinMapped(data.thoughts.qa, (qa) => `${qa.question} -> ${qa.answer} (${qa.source}, ${qa.date})`)}`
  );

  return lines.join('\n');
}
