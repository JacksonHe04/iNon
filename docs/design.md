# iNon 视觉与布局重构设计文档 (Layout & Design Specification)

> 基于用户架构沟通决定的最新产品与页面布局设计规范。

---

## 1. 页面三大板块与布局规范

### 1.1 个人公开网站 (`/:username` 及 `/`)

- **顶部导航栏 (TopNav)**：
  - 维持原有高质感毛玻璃 TopNav，**移除**顶部的黑条 Switcher。
  - **右侧集成 UserInfo 组件**：
    - 未登录状态：显示“登录”按钮，点击弹出 Auth 登录/注册 Modal。
    - 已登录状态：显示当前登录用户头像/名字，点击快速进入个人控制台 `/i/:username`。
- **左侧边栏 (SideNav)**：
  - 保留浮动毛玻璃 SideNav，锚点滚动切换：经历、教育、工作、开发、产品、读书、影片、创作、音乐、嘻哈、活动、标签、联系、留言。

---

### 1.2 个人控制台 (`/i/:username`)

- **左侧侧边栏 (Control Dashboard SideNav)**：
  - **视觉样式**：与公开页面的左侧毛玻璃 SideNav 保持 100% 视觉一致。
  - **导航菜单项**：
    1. **主页** (Home)：包含 AI 对话框、网页快捷入口、项目快捷入口等
    2. **内容库管理** (Content Library)：音乐、影视、书架、游戏、经历与作品库
    3. **公开网站配置** (Site Settings)：网站布局排版配置与访客视角预览（Live Preview）
- **内联交互编辑 (Direct / Inline Editing)**：
  - 放弃原 Admin 中繁琐的键值对与表格编辑模式。
  - 在控制台各板块中提供**所见即所得 (WYSIWYG) 直接编辑/直接打字/卡片原位编辑**能力。

---

### 1.3 后台管理页 (`/admin`)

- **定位收拢**：专职负责全局**资产库 (Supabase Storage 对象存储)** 的上传、预览与清理。
- 移除非必要模块（如旧版留言审核与纯键值对编辑），所有内容编辑权完全下放并融入至各用户的个人控制台中。

---

## 2. 设计系统与组件规范 (Design Tokens)

1. **Glassmorphism 视觉**：
   - 使用统一的 `GlassCard` 封装毛玻璃层级（`backdrop-blur-xl`, `border-white/30`, `bg-white/30`）。
2. **主题色**：
   - 品牌渐变：`from-green-400 to-teal-400` 与 `from-teal-500 to-emerald-500`。
   - 暗黑/亮色混合兼容适配。
