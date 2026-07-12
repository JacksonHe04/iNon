# iNon — 一块块，搭起完全属于你的个人主页

> **iNon** — 一个基于 Block 的个人 OS，让你的个人主页真正属于你。
> *开源、高度可定制、简单到极致。*
>
> 一个个人 OS：控制台（`/i/:slug`）与数字花园（/:slug）。

[🌐 English](../README.md) · 简体中文 · [繁體中文](README_ZH_TW.md) · [日本語](README_JA.md)

---

## 它是什么

iNon 是一个**开源、可高度定制**的个人主页系统。
你可以**像搭积木一样**拖入各种 Block，拼出你的个人主页——收藏夹、作品集、音乐墙、书架、AI 分身……

所有内容你自己定义，所有排版你自己决定，所有数据你自己持有。
**不需要懂一行代码，也能拼出非常好看且高度个人化的主页。**

但如果你就是想动代码——也很好。整套系统是 AGPL-3.0 协议开源的，Fork 它、改造它、把它接到你自己的后端，全部欢迎。

---

## 为什么选 iNon

市面上的"个人主页"大多是模板——选个模板、填字段、套皮肤。表面上是你的，骨子里不是你定的。

iNon 不一样。它的核心是 **22 个独立 Block**，每个 Block 负责展示一类内容。**Block 的拼装顺序、并排/上下、显示/隐藏，全部由你自己决定。** Block 与 Block 之间不绑死，想加就加、想挪就挪、想藏就藏。

更重要的是——**控制台怎么摆，公开页就怎么呈现**。所见即所得，所设即所得。

---

## 一眼能看到的

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

---

## 谁在用它

- **普通创作者**：只想有一个好看的个人主页。在线注册、拖几个 Block、填点内容、立刻拥有一个能发出去的网址。
- **独立开发者**：想要一个可 fork、可改、可自部署的开源底座。整个仓库给你，协议给你，组件给你，你怎么玩都可以。

---

## 它是怎么运转的

```
                        ┌──────────────────────────────┐
                        │        Supabase 数据库        │
                        │   (Postgres + Auth + Storage) │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │            iNon 核心引擎                    │
                │     (Next.js 16 + React 19 + R3F)           │
                │     ─ Block 注册表（单一事实源）             │
                │     ─ 画板拖拽排版引擎                       │
                │     ─ 多主题 + 暗黑模式                      │
                │     ─ AI 分身流式对话                        │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    控制台 /i/:slug      │    │    公开主页 /:slug      │
          │                         │    │                         │
          │  • 可视化画板排版        │    │  • 毛玻璃 + 暗黑模式    │
          │  • Block 拖拽 / 排序    │    │  • React Three Fiber    │
          │  • 内容全量 CRUD        │    │    3D 场景（书桌、星系）│
          │  • 多主题实时切换       │    │  • AI 分身悬浮对话      │
          │  • 账号与安全设置       │    │  • 响应式（移动 / 桌面）│
          │  • 自动保存              │    │  • 只读，所见即所得     │
          └─────────────────────────┘    └─────────────────────────┘
```

后台管理（`/admin`）仅向**超级管理员**开放，专用于资产库与对象存储维护。

---

## 22 个 Block：你想展示什么，就拼什么

每个 Block 是一类内容的最小展示单元。它们都被同一个**注册表**统一管理——任何地方看到 Block 标题、图标，永远只来自这一处真相。

| Block | 展示内容 |
| --- | --- |
| **个人简介** (`bio`) | 头像、姓名、bio、城市定位、年龄进度、社交链接。 |
| **常用网站** (`bookmarks`) | 常用网址与开发工具的网格。 |
| **核心项目** (`projects`) | 单个项目的封面、状态、摘要、技术栈与跳转。 |
| **App 启动** (`app_launcher`) | 应用与工具的快捷启动阵列。 |
| **开发工具** (`dev_tools`) | 开发者日常工具集合。 |
| **音乐收藏** (`music`) | 音乐人与专辑网格，支持横向滚动。 |
| **嘻哈收藏** (`hiphop`) | 独立于音乐之外的嘻哈作品集合。 |
| **影视收藏** (`movies`) | 影片海报与 3D 书桌联动。 |
| **书单收藏** (`books`) | 阅读书桌与书目摘要卡片。 |
| **游戏收藏** (`games`) | 游戏网格与互动展示。 |
| **产品收藏** (`products`) | 喜欢的产品、推荐产品、自用硬件。 |
| **个人创作** (`creation`) | 视频、文章、演讲、格言与引言汇总。 |
| **时间线** (`timeline`) | 个人里程碑与履历瀑布流。 |
| **教育背景** (`education`) | 学校、专业、导师与学习轨迹。 |
| **工作履历** (`work`) | 当前工作、过往职位与职业偏好。 |
| **专业技能** (`skills`) | 技术栈与能力标签。 |
| **Live 现场** (`events`) | 演出、演讲、线下活动。 |
| **标签墙** (`tags`) | 关键词、价值观、习惯、标签的视觉墙。 |
| **友情链接** (`friend_links`) | 友链矩阵。 |
| **联系方式** (`contact`) | 留言表单与社交触点。 |
| **思考** (`thoughts`) | 灵光一现与短篇思考。 |
| **AI 分身** (`ai_clone`) | 以你的档案为底料的悬浮 AI 对话。 |

加一个新 Block 只改一处：注册表。新组件加进 `components/blocks/`，注册表加一行，UI 的所有角落（侧栏菜单、控制台画板、公开页）就都认了。

---

## 关键能力

- **画板式排版** — 在 `/i/:slug` 拖拽、排序、隐藏、调整宽度（单/双栏），所见即所得。
- **22+ 个 Non Block** — 同一套组件系统同时驱动控制台与公开页，零重复。
- **多 Slug + 权限设计**
  - `/:slug`：所有人均可访问的只读公开主页。
  - `/i/:slug`：账户所有人的控制台，能写能改。
  - `/admin`：仅管理员可访问的资产库。
- **AI 分身** — `/api/assistant` 流式接口，把你的内容档案转成系统 Prompt，对接任意 OpenAI 兼容模型。
- **沉浸式 3D** — React Three Fiber 书桌、星系、深水区场景，搭配暗色 Canvas 背景。
- **多主题** — 控制台里实时切换主题与暗色模式，公开页同步刷新。
- **响应式** — 桌面端 1/2 列自适应，移动端折叠为单列与悬浮侧栏。
- **资产库** — 全局共享图床，Block 内的图片直接上传，无需外链。
- **自动保存** — 编辑过程所见即所得，告别"忘记点保存"。
- **版本号随提交自动 bump** — 顶栏通知区随时显示当前版本。

---

## 技术栈

- **框架**：Next.js 16（App Router、Turbopack、React Server Components、Proxy）
- **语言**：TypeScript 6 + React 19
- **数据库与认证**：Supabase（Postgres + Auth + Storage，`@supabase/ssr` + `@supabase/supabase-js`）
- **样式与 UI**：Tailwind CSS 4 + 多主题系统 + Framer Motion + Lucide React
- **三维图形**：Three.js + React Three Fiber + @react-three/drei
- **状态与数据**：Zustand、@tanstack/react-query、nuqs
- **表单与校验**：react-hook-form + Zod
- **主题切换**：next-themes
- **访问分析**：`@vercel/analytics` + IP 加盐哈希

---

## 仓库结构

```
iNon/
├── app/
│   ├── (home)/                  # 平台首页（未登录访客落地）
│   ├── [slug]/                  # 用户公开主页 (/:slug)
│   ├── i/[slug]/                # 用户控制台 (/i/:slug)
│   ├── admin/                   # 后台资产库 (/admin)
│   ├── login/                   # 登录
│   ├── api/
│   │   ├── assistant/           # AI 分身流式接口
│   │   ├── messages/            # 访客留言
│   │   ├── account/             # 当前用户的设置 / 内容 / 布局
│   │   └── admin/               # 管理员侧的资源 / 内容 / 上传 / 删除
│   ├── layout.tsx
│   └── globals.css              # Tailwind 4 与全局样式
├── components/
│   ├── blocks/                  # 22 个 Non Block + Canvas 引擎 + 渲染器
│   ├── scenes/                  # React Three Fiber 3D 场景
│   ├── dashboard/               # 控制台 UI（侧栏、列表、Card 等）
│   ├── editor/                  # 基于 Schema 的内容编辑器
│   ├── layout/                  # Shell 布局、顶栏、悬浮侧栏
│   ├── ai/                      # AI 助手 UI（流式响应）
│   ├── ui/                      # 通用 UI 原子（玻璃拟态、按钮、表单）
│   ├── BackGround.tsx           # Canvas 动态流动背景
│   └── GlassCard.tsx            # 毛玻璃 UI 原型
├── hooks/                       # 客户端 hooks（AI / 资产 / 布局 / 时钟 / 距离）
├── lib/
│   ├── blocks/registry.ts       # Block 单一事实源（标题、图标）
│   ├── content.ts               # 数据拉取与字段映射
│   ├── markdown.ts              # 档案转 Markdown（AI System Prompt）
│   ├── auth/                    # Supabase 会话、权限、用户名解析
│   ├── supabase/                # Supabase 客户端与中间件
│   ├── admin/                   # 管理员侧 helpers
│   ├── analytics/               # 访问统计与 IP 哈希
│   └── utils.ts                 # 工具（距离、年龄、格式化）
├── types/                       # TypeScript 类型（database / layout / index）
├── scripts/                     # 迁移、导库、校验、上传资产、管理员初始化
├── supabase/                    # Supabase 配置与数据库迁移
├── proxy.ts                     # Next.js Proxy（会话刷新 + 路由保护）
├── components.json              # shadcn 风格组件配置
└── docs/                        # 多语言 README 与界面预览图
```

---

## 本地开发

### 前置要求

- Node.js ≥ 20
- pnpm

### 环境变量

参考 `.env.example` 创建 `.env.local`：

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_DISPLAY_NAME=
ANALYTICS_IP_SALT=
```

### 安装与启动

```bash
# 安装依赖
pnpm install

# 启动 Turbopack 开发服务器
pnpm dev
```

本地服务运行于 `http://localhost:3000`。

### 常用脚本

```bash
pnpm db:push             # 推送 Supabase 数据库迁移
pnpm db:validate         # 校验数据库结构与字段完整性
pnpm db:seed-admin       # 初始化管理员账号
pnpm db:upload-assets    # 上传本地资产到 Supabase Storage
pnpm lint                # ESLint
pnpm build               # 生产构建
```

---

## 路线图

- [x] 数据库全量迁移至 Supabase（Postgres + Auth + Storage），并提供控制台 CMS
- [x] 可视化画板拖拽排版引擎（BlockCanvasEngine）
- [x] 22 个 Non Block 通过统一注册表驱动
- [x] 多主题 + 暗色模式 + Canvas 动态背景
- [x] 资产库 + Block 图片直传
- [x] 自动保存 + 版本号随提交自动 bump
- [ ] AI 分身支持多模型路由与访客上下文记忆
- [ ] 履历 / 教育 / 产品 3D 场景细节迭代
- [ ] CMS 资产细粒度发布流与留言审核增强

---

## 协议

本项目以 **GNU Affero General Public License v3.0 (AGPL-3.0)** 协议开源。
也即：**任何 fork 或基于本项目的衍生作品，若通过网络向公众提供服务，必须以兼容协议开源其完整源码。**

这是为了保证 iNon 永远是社区的，而不是某一家公司的私有产物。

完整协议正文见仓库根目录的 [LICENSE](../LICENSE) 文件。

---

## 它一路走来的样子

从一份空白的脚手架，到一个可以自由拼装的个人 OS，iNon 是这样一步一步长成今天这样的。如果你好奇它的故事——那些悄悄的打磨、那些重写、那个它真正长大的日子——可以读读这份 [产品演进旅程](PROJECT_EVOLUTION.md)。

---

## 致谢与作者

由 [YingYingDontKill（何锦诚 / Jackson He）](https://github.com/JacksonHe04) 用心维护。
如果它对你有帮助，欢迎 Star、反馈、Fork——一切能让它走得更远的事情。
