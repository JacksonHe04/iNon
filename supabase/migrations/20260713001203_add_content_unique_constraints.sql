-- 为内容管理相关表添加 UNIQUE 约束，防止同一 profile 下出现业务键重复
-- 修复 useSectionSave unmount cleanup 触发的重复保存问题
-- 生成于 2026-07-13 00:12

-- notifications：同一 profile 同一日期/正文/类型只能有一条
ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_profile_date_text_type_unique
  UNIQUE (profile_id, notification_date, text, type);

-- profile_list_items：同一 profile 同一 list_type 同一 value
ALTER TABLE public.profile_list_items
  ADD CONSTRAINT profile_list_items_profile_type_value_unique
  UNIQUE (profile_id, list_type, value);

-- profile_tags：同一 profile 同一 tag_type 同一 value
ALTER TABLE public.profile_tags
  ADD CONSTRAINT profile_tags_profile_type_value_unique
  UNIQUE (profile_id, tag_type, value);

-- experiences：同 profile 同一 city/date/description
ALTER TABLE public.experiences
  ADD CONSTRAINT experiences_profile_city_date_desc_unique
  UNIQUE (profile_id, city, event_date, description);

-- schools
ALTER TABLE public.schools
  ADD CONSTRAINT schools_profile_inst_major_degree_start_unique
  UNIQUE (profile_id, institution, major, degree, start_date);

-- jobs
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_profile_company_position_start_end_unique
  UNIQUE (profile_id, company_name, position, start_date, end_date);

-- development_skills
ALTER TABLE public.development_skills
  ADD CONSTRAINT development_skills_profile_type_value_unique
  UNIQUE (profile_id, skill_type, value);

-- projects
ALTER TABLE public.projects
  ADD CONSTRAINT projects_profile_name_start_unique
  UNIQUE (profile_id, project_name, start_date);

-- dev_tools
ALTER TABLE public.dev_tools
  ADD CONSTRAINT dev_tools_profile_name_link_unique
  UNIQUE (profile_id, name, link);

-- product_items
ALTER TABLE public.product_items
  ADD CONSTRAINT product_items_profile_type_name_unique
  UNIQUE (profile_id, item_type, name);

-- hardware_items
ALTER TABLE public.hardware_items
  ADD CONSTRAINT hardware_items_profile_category_value_unique
  UNIQUE (profile_id, category, value);

-- creation_items
ALTER TABLE public.creation_items
  ADD CONSTRAINT creation_items_profile_type_title_unique
  UNIQUE (profile_id, item_type, title);

-- performances
ALTER TABLE public.performances
  ADD CONSTRAINT performances_profile_type_name_date_unique
  UNIQUE (profile_id, event_type, name, event_date);

-- contact_methods
ALTER TABLE public.contact_methods
  ADD CONSTRAINT contact_methods_profile_name_content_unique
  UNIQUE (profile_id, method_name, content);

-- platform_accounts
ALTER TABLE public.platform_accounts
  ADD CONSTRAINT platform_accounts_profile_platform_username_unique
  UNIQUE (profile_id, platform_name, username);

-- thought_qa
ALTER TABLE public.thought_qa
  ADD CONSTRAINT thought_qa_profile_question_unique
  UNIQUE (profile_id, question);
