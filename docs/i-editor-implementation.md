# i 控制台全量编辑公开页 Block 实施方案

## 1. 目标
彻底实现公开页面的所有 Block/内容（共 16 个核心分区）都可以在 `/i/:username` 控制台中进行独立可视化编辑、持久化保存与实时预览。

## 2. 涉及的 16 个 Block 分区
1. **Basic (基本信息)**: 姓名、Intro、状态、关键词、价值观、标签、Meta 信息。
2. **Life (生活状态)**: 城市、生日、星座、生活/工作 MBTI、习惯、喜爱的美食与饮品。
3. **Experience (个人经历)**: 经历地点、时间、描述列表。
4. **Education (教育背景)**: 院校履历列表、本科专业、导师。
5. **Work (工作履历)**: 当前工作、职位履历列表、工作偏好。
6. **Development (技术与开源)**: 技术栈、专业技能、项目作品集、开发工具。
7. **Products (硬件与产品推荐)**: 喜爱产品、推荐产品、喜爱品牌、个人硬件清单。
8. **Creation (内容创作)**: 视频/播客系列、文章列表、演讲列表、格言与金句。
9. **Reading (书单与作者)**: 书籍列表、喜爱作者列表。
10. **Films (影单与导演)**: 影视海报墙列表、喜爱导演列表。
11. **Music (音乐)**: 音乐专辑、歌曲、音乐人。
12. **Hiphop (嘻哈音乐)**: 嘻哈专辑、歌曲、音乐人。
13. **Events (里程碑事件/演出)**: 演出/活动列表。
14. **Contact (联系方式与平台)**: 联系方式列表、平台账号列表。
15. **Thoughts (深水区与思考)**: 个人哲学、行业视角、意识形态、生活元素、宏观愿景、个人愿景、Q&A 问答。
16. **Notifications (个人动态/公告)**: 动态列表（日期、内容、类型）。

## 3. 组件与架构设计
- **高度复用表单系统 (`components/editor/`)**:
  - `EditorSectionCard.tsx`: 带有统一的高颜值 Glassmorphism 样式、保存状态反馈、单独/批量保存按钮。
  - `TextInput.tsx` / `TextAreaInput.tsx`: 统一深色/浅色高质感输入框。
  - `StringListEditor.tsx`: 字符串列表编辑增删组件。
  - `ObjectArrayEditor.tsx`: 通用对象数组可视化编辑组件。
- **`/i` 控制台 UI 增强**:
  - 在 `DashboardSideNav` 中提供“公开页 Block 编辑”选项，或者在控制台 Tab 页面中提供直观的分区切换抽屉/标签页。
  - 支持调用 `/api/admin/content/[section]` 接口完成全量 Supabase 数据库保存与 revalidate。

## 4. 开发计划
- [x] 架构设计与文档记录
- [ ] 提取并封装通用的 Block 编辑器 UI 组件库 (`components/editor/`)
- [ ] 构建公开页 16 个分区的可视化编辑器集合 (`components/editor/sections/`)
- [ ] 集成到 `/i/[username]` 页面（DashboardClient）
- [ ] 测试持久化保存接口与实时 Preview 机制
