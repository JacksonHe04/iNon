# iNon 重构与升级方案 (Refactoring & Architecture Plan)

## 1. 核心目标

将 iNon 从单一角色的沉浸式数字花园，升级重构成一个 **Block-based（基于非原/Non 模块化）的个人操作系统**。

## 2. 核心系统架构与权限设计

### 2.1 路由与权限规则 (Routing & Permissions)

| 路由路径 | 页面类型 | 权限说明 | 核心功能 |
| :--- | :--- | :--- | :--- |
| `/` | 特例首页 | 所有人可读 | 我（JacksonHe04）的公开页 (即个人网站默认入口) |
| `/:username` | 个人公开页 | 所有人可读 | 任意用户的公开个人网站（作品集展示、AI 分身对话入口） |
| `/i/:username` | 个人管理后台 | 仅本人/管理员可读写 | 个人操作系统面板：常用网站、库管理（音乐/影视/游戏）、项目管理、组件排版与外观预览 |
| `/admin` | 全局后台 | 仅管理员可读写 | 全局用户管理、系统配置、公共资产与审核管理 |

### 2.2 原子组件定义 (Non Block Architecture)

通过同一套组件系统同时驱动「个人管理后台 `/i/:username`」与「公开页面 `/:username`」：

- **快捷入口类 (Shortcut & Portal)**
  - 网站收藏夹 (Bookmarks Grid)
  - App 启动器入口 (App Launcher)
  - 人物卡片 (Contact Card & Quick Chat)
  - 项目状态卡片 (Project Status Summary)
- **内容展示类 (Content & Media)**
  - 音乐卡片 / 正在播放 (Music & Now Playing)
  - 影视海报墙 (Movies Grid)
  - 电子书架 (Books Shelf)
  - 游戏收藏 (Games Grid)
- **对外展示与社交类 (Public & Social)**
  - 个人简介卡 (Bio Header)
  - 作品集 Showcase (Portfolio Items)
  - AI 分身入口 (AI Clone Chat Widget)
  - 动态时间线 (Milestones & Timeline)
  - 友情链接 (Friend Links Grid)
  - GitHub 贡献热力图 (GitHub Contribution Heatmap)

---

## 3. 重构开发顺序 (Development Roadmap)

- [ ] **Phase 1: Layout & Menu** — 统一重构基础布局与多路由导航体系（支持 `/`, `/:username`, `/i/:username`, `/admin`）
- [ ] **Phase 2: Auth** — 基于 Supabase Auth 构建多用户认证体系、权限保护中间件与路由校验
- [ ] **Phase 3: Theme** — 构建统一的暗黑/亮色主题系统与毛玻璃视觉 Design Tokens
- [ ] **Phase 4: Design & Component (Block/Non System)** — 抽象并实现 Block-based 的模块化个人 OS 组件库
- [ ] **Phase 5: i18n** — 国际化支持
- [ ] **Phase 6: Dev Rules** — 完善开发标准、统一规范与组件封装最佳实践

---

## 4. 阶段一：Layout & Menu 实施准备

1. 更新 Next.js 路由结构：
   - 提取全局公共 Shell Layout (`app/layout.tsx` & `components/layout/*`)
   - 建立动态路由 `app/[username]/page.tsx`
   - 建立个人管理后台路由 `app/i/[username]/page.tsx`
   - 建立管理员路由 `app/admin/page.tsx`
2. 重构 TopNav & Menu 状态机，适应多视角（访客视角 vs. 个人管理视角 vs. 管理员视角）。
