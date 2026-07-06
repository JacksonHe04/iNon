# iNon — 基于 Block 的个人操作系统与数字花园

> **iNon** — 一个本地优先、高度可自定的 Block 个人操作系统与数字花园。
> 基于 Next.js 16、Supabase、React Three Fiber 以及统一的原子组件系统（"Non"）构建。
>
> 一个个人 OS：控制台（`/i/:slug`）与数字花园（`/:slug`）。

🌐 **其他语言版本：** [English](../README.md) · [简体中文](README_ZH_CN.md) · [繁體中文](README_ZH_TW.md) · [日本語](README_JA.md)

## 界面预览

| 主页叙事区 |
| --- |
| ![主页叙事区](images/desktop-home.png) |

| AI 问答提问 | AI 问答回答 |
| --- | --- |
| ![兴趣爱好提问](images/desktop-hobby-ask.png) | ![兴趣爱好回答](images/desktop-hobby-anwser.png) |
| ![MBTI匹配提问](images/desktop-mbti-ask.png) | ![MBTI匹配问答](images/desktop-mbti-anwser.png) |

| 移动端首页 | 移动端菜单 | 移动端问答 | 移动端星系 |
| --- | --- | --- | --- |
| ![移动端首页](images/mobile-home.png) | ![移动端菜单](images/mobile-menu.png) | ![移动端问答](images/mobile-ask.png) | ![移动端星系](images/mobile-galaxy.png) |

| 音乐卡片 | 电影与书籍书桌 |
| --- | --- |
| ![音乐卡片](images/desktop-music.png) | ![电影卡片](images/desktop-desk.png) |

| 标签墙 | 深水区 |
| --- | --- |
| ![标签墙](images/desktop-label.png) | ![进入深水区](images/desktop-into-deepwater.png) |

## 系统架构

```
                        ┌──────────────────────────────┐
                        │        Supabase 数据库       │
                        │ (Postgres + Auth + Storage)  │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │             iNon 核心系统                   │
                │     (Next.js 16 + React 19 + R3F)           │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    控制台 /i/:slug      │    │    公开主页 /:slug      │
          │                         │    │                         │
          │ • 主页 (快捷入口与 AI)  │    │ • 毛玻璃沉浸设计        │
          │ • 内容全量 CRUD 管理    │    │ • 3D 书桌与 R3F 星系    │
          │ • 画板拖拽排版引擎      │    │ • 动态 Non 模块         │
          │ • 账号与安全设置        │    │ • AI 分身助手           │
          └─────────────────────────┘    └─────────────────────────┘
```

## 它是什么

iNon 将传统的个人网站搭建升级为一个 **block-based 的个人操作系统**。它通过统一的组件架构同时驱动个人控制台（`/i/:slug`）与公开数字花园（`/:slug`）。用户可以在控制台中轻松管理个人档案、开发项目、网页快捷入口、影视音乐收藏以及 AI 分身对话，并向访客展示兼具 3D 与毛玻璃质感的个人主页。

## 核心亮点

- **基于 Block 的操作系统（"Non" 系统）**：统一的模块化组件体系，同时驱动私有工作区与公开展示页。
- **画板拖拽排版引擎**：在 `/i/:slug` 中提供实时拖拽画布（`BlockCanvasEngine`），支持区块排序、显示/隐藏切换及响应式单双栏调整（50% / 100% 宽度），效果与公开页一致。
- **多 Slug 与权限设计**：
  - `/:slug`：所有人均可访问的只读个人公开数字花园。
  - `/i/:slug`：仅账户所有人可见可写的控制台，用于编辑内容、排版及账号设置。
  - `/admin`：仅超级管理员可访问的资产库与对象存储管理页。
- **AI 分身助手**：内置 `/api/assistant` 路由，将本地个人档案转化为 Markdown Prompt，串流对接智谱 GLM / 大模型提供实时问答。
- **沉浸式 3D 与微交互**：集成 React Three Fiber 3D 场景（产品书桌、创作星系等）、Canvas 动态背景、暗黑模式及 Framer Motion 平滑过渡。

## 原子定义：Non 组件

iNon 采用粒度明确的 "Non" 原子组件定义系统功能上限：

| 模块组件 | 描述 |
| --- | --- |
| **个人简介卡** (`BioHeaderBlock`) | 头像、姓名、bio、城市定位距离计算、年龄进度条与社交链接。 |
| **网站收藏夹** (`BookmarkBlock`) | 常用网站网格与开发工具快捷入口。 |
| **项目卡片** (`ProjectBlock`) | 单个项目的封面、状态、摘要、技术栈标签与快速跳转。 |
| **音乐卡片** (`MusicBlock`) | 音乐人与专辑收藏网格，支持横向滚动。 |
| **影片海报墙** (`MovieBlock`) | 影片网格与 3D 书桌联动。 |
| **书架** (`BookBlock`) | 阅读书桌与书目摘要卡片。 |
| **游戏收藏** (`GameBlock`) | 游戏网格与互动展示。 |
| **AI 分身入口** (`AiCloneBlock`) | 悬浮 AI 对话与串流助手交互界面。 |
| **动态时间线** (`TimelineBlock`) | 公开的个人里程碑与履历瀑布流。 |
| **友链** (`FriendLinkBlock`) | 友情链接互动网格。 |
| **联系卡片** (`ContactBlock`) | 留言表单与社交触点。 |
| **应用启动器** (`AppLauncherBlock`) | 常用应用与工具快捷启动阵列。 |

## 技术栈

- **框架**：Next.js 16 (App Router, Turbopack)
- **语言**：TypeScript 6 + React 19
- **数据库与认证**：Supabase Postgres + Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **样式与 UI**：Tailwind CSS 4 + 毛玻璃设计系统 + Framer Motion
- **三维图形**：Three.js + React Three Fiber + @react-three/drei
- **状态与工具**：Zustand, TanStack React Query, Nuqs, Zod, Lucide React

## 项目结构

```
iNon/
├── app/
│   ├── [slug]/                  # 用户公开主页 (/:slug)
│   ├── i/                       # 用户控制台 (/i/:slug)
│   ├── admin/                   # 后台资产库管理 (/admin)
│   ├── api/assistant/route.ts   # AI 助手串流路由
│   └── globals.css              # Tailwind 4 与全局样式
├── components/
│   ├── blocks/                  # "Non" 原子组件与画板引擎
│   ├── scenes/                  # React Three Fiber 3D 场景 (ProductDesk, Galaxy等)
│   ├── dashboard/               # 控制台 UI 组件 (/i/:slug)
│   ├── editor/                  # 内容 Block 全量编辑组件
│   ├── layout/                  # Shell 布局、顶栏、侧栏
│   ├── BackGround.tsx           # Canvas 动态流动背景
│   └── GlassCard.tsx            # 毛玻璃 UI 原型
├── data/readme.json             # 种子数据与备份快照
├── lib/
│   ├── auth/                    # Supabase 会话与权限工具
│   ├── content.ts               # 数据拉取与 Schema 映射
│   ├── markdown.ts              # 档案转 Markdown (AI System Prompt)
│   └── utils.ts                 # 定位、距离与年龄计算函数
├── supabase/                    # Schema 迁移与 Supabase 配置
├── scripts/                     # 导库、校验、资产上传与管理员初始化脚本
├── types/                       # TypeScript 类型与 Layout 配置定义
└── docs/                        # 多语言 README 文档与预览图片
```

## 本地开发指南

### 前置要求

- Node.js ≥ 20
- pnpm（推荐）

### 环境变量配置

参考 `.env.example` 创建 `.env.local` 文件：

```env
OPENAI_API_KEY=your_openai_or_zhipu_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动 Turbopack 本地开发服务器
pnpm dev

# 代码检查与生产构建
pnpm lint
pnpm build
```

本地服务默认运行在 `http://localhost:3000`。

### 数据库常用脚本

```bash
# 推送 Supabase 数据库 Migration
pnpm db:push

# 导入 JSON 数据至 Supabase
pnpm db:import

# 校验数据库结构与字段完整性
pnpm db:validate

# 初始化管理员账号
pnpm db:seed-admin
```

## 路线图

- [x] 运行时数据全量迁移至 Supabase Postgres & Storage 并提供后台 CMS。
- [x] 可视化 Block 画板拖拽排版引擎（`BlockCanvasEngine`）。
- [x] 完善 Non 组件系统（14+ 原子 Block）。
- [ ] 履历与教育星系的 3D 场景细节迭代。
- [ ] AI 分身支持多模型策略与访客上下文记忆。
- [ ] CMS 资产细粒度发布流与留言审核增强。

## 开源许可证

[MIT](LICENSE)

## 作者

[YingYingDontKill (何锦诚 / Jackson He)](https://github.com/JacksonHe04)
