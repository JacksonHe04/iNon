import { ReadmeData } from '@/types';

export function readmeDataToMarkdown(data: ReadmeData): string {
  const lines: string[] = [];

  lines.push(`# ${data.meta.title}`);
  lines.push(`_${data.meta.description}_`, ``);
  lines.push(`## 基础信息`);
  lines.push(`- 姓名：${data.basic.name}`);
  lines.push(`- 简介：${data.basic.intro}`);
  lines.push(`- 当前状态：${data.basic.current_status}`);
  lines.push(`- 关键词：${data.basic.keywords.join(', ')}`);
  lines.push(`- 价值观：${data.basic.values.join(', ')}`);
  lines.push(`- 标签：${data.basic.tags.join(', ')}`, ``);

  lines.push(`## 生活`);
  lines.push(`- 城市：${data.life.current_city}`);
  lines.push(`- MBTI：生活 ${data.life.mbti.life_mbti} / 工作 ${data.life.mbti.work_mbti}`);
  lines.push(`- 生日：${data.life.birth_date}`);
  lines.push(`- 星座：${data.life.zodiac_sign || '未填写'}`);
  lines.push(`- 习惯：${data.life.habits.join(', ')}`);
  lines.push(`- 饮食：最爱食物 ${data.life.diet.favorite_food.join(', ')}；最爱饮品 ${data.life.diet.favorite_drinks.join(', ')}`, ``);

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
  lines.push(`- 工作偏好：${data.work.work_preferences.join(', ')}`, ``);

  lines.push(`## 开发与项目`);
  lines.push(`- 技术栈：${data.development.skills.tech_stack.join(', ')}`);
  lines.push(`- 专长：${data.development.skills.expertise.join(', ')}`);
  data.development.projects.forEach((project) => {
    lines.push(`- ${project.project_name} (${project.start_date} - ${project.end_date})：${project.description}`);
    lines.push(`  - 技术：${project.tech_stack.join(', ')}；角色：${project.role.join(', ')}`);
    if (project.link) lines.push(`  - 链接：${project.link}`);
    if (project.github) lines.push(`  - GitHub：${project.github}`);
  });
  lines.push('');

  lines.push(`## 产品与设备`);
  lines.push(`- 最爱产品：${data.products.favorite_products.map((p) => `${p.name}(${p.intro})`).join('; ')}`);
  lines.push(`- 推荐产品：${data.products.recommended_products.map((p) => `${p.name}(${p.intro})`).join('; ')}`);
  lines.push(`- 设备：手机 ${data.products.my_hardware.phone}，电脑 ${data.products.my_hardware.computer}，平板 ${data.products.my_hardware.tablet}，手表 ${data.products.my_hardware.smartwatch}，耳机 ${data.products.my_hardware.headphones.join(', ')}`, ``);

  lines.push(`## 创作`);
  lines.push(`- 视频：${data.creation.videos.map((v) => `${v.series} - ${v.title}`).join('; ')}`);
  lines.push(`- 文章：${data.creation.articles.map((a) => `${a.title}`).join('; ')}`);
  lines.push(`- 演讲：${data.creation.speeches.map((s) => `${s.speech_name}`).join('; ')}`);
  lines.push(`- 座右铭：${data.creation.mottos.join(' / ')}`);
  lines.push(`- 语录：${data.creation.quotes.join(' / ')}`, ``);

  lines.push(`## 库 (Library)`);
  if (data.library.book.works.length > 0 || data.library.book.creators.length > 0) {
    lines.push(`### 读书`);
    if (data.library.book.works.length > 0) {
      lines.push(`- 书籍：${data.library.book.works.map((b) => `${b.name} - ${b.creator}`).join('; ')}`);
    }
    if (data.library.book.creators.length > 0) {
      lines.push(`- 作家/学者：${data.library.book.creators.map((a) => `${a.name}`).join(', ')}`);
    }
  }
  if (data.library.film.works.length > 0 || data.library.film.creators.length > 0) {
    lines.push(`### 影视`);
    if (data.library.film.works.length > 0) {
      lines.push(`- 影片：${data.library.film.works.map((f) => `${f.name} - ${f.creator}`).join('; ')}`);
    }
    if (data.library.film.creators.length > 0) {
      lines.push(`- 导演/影人：${data.library.film.creators.map((d) => d.name).join(', ')}`);
    }
  }
  if (data.library.music.works.length > 0 || data.library.music.songs.length > 0 || data.library.music.creators.length > 0) {
    lines.push(`### 音乐`);
    if (data.library.music.works.length > 0) {
      lines.push(`- 专辑：${data.library.music.works.map((a) => `${a.name} - ${a.creator}`).join('; ')}`);
    }
    if (data.library.music.songs.length > 0) {
      lines.push(`- 单曲：${data.library.music.songs.map((s) => `${s.name} - ${s.creator}`).join('; ')}`);
    }
    if (data.library.music.creators.length > 0) {
      lines.push(`- 音乐人：${data.library.music.creators.map((m) => m.name).join(', ')}`);
    }
  }
  if (data.library.game.works.length > 0 || data.library.game.creators.length > 0) {
    lines.push(`### 游戏`);
    if (data.library.game.works.length > 0) {
      lines.push(`- 游戏：${data.library.game.works.map((g) => `${g.name} - ${g.creator}`).join('; ')}`);
    }
    if (data.library.game.creators.length > 0) {
      lines.push(`- 开发商/制作人：${data.library.game.creators.map((d) => d.name).join(', ')}`);
    }
  }
  lines.push(``);

  lines.push(`## 活动`);
  data.events.performances.forEach((event) => {
    lines.push(`- ${event.type}：${event.name} (${event.date}, ${event.location})`);
  });
  lines.push('');

  lines.push(`## 联系与平台`);
  lines.push(`- 联系方式：${data.contact.contact_info.map((info) => `${info.method_name}:${info.content}`).join('; ')}`);
  lines.push(`- 平台账号：${data.contact.platform_accounts.map((p) => `${p.platform_name}:${p.username}`).join('; ')}`, ``);

  lines.push(`## 思想`);
  lines.push(`- 个人哲学：${data.thoughts.personal_philosophy.join(' / ')}`);
  lines.push(`- 行业观点：${data.thoughts.industry_views.join(' / ')}`);
  lines.push(`- 意识形态：${data.thoughts.ideology.join(' / ')}`);
  lines.push(`- 生命元素：${data.thoughts.life_elements.join(', ')}`);
  lines.push(`- 宏观愿景：${data.thoughts.macro_vision.join(' / ')}`);
  lines.push(`- 个人愿景：${data.thoughts.personal_vision.join(' / ')}`);
  lines.push(
    `- 问答：${data.thoughts.qa
      .map((qa) => `${qa.question} -> ${qa.answer} (${qa.source}, ${qa.date})`)
      .join('; ')}`
  );

  return lines.join('\n');
}
