# iNon — 一塊一塊，搭起完全屬於你的個人主頁

> **iNon** — 一個基於 Block 的個人 OS，讓你的個人主頁真正屬於你。
> *開源、高度可定制、簡單到極致。*
>
> 一個個人 OS：控制台（`/i/:slug`）與數字花園（/:slug）。

[🌐 English](../README.md) · [简体中文](README_ZH_CN.md) · 繁體中文 · [日本語](README_JA.md)

---

## 它是什麼

iNon 是一個**開源、高度可定制**的個人主頁系統。
你可以**像搭積木一樣**拖入各種 Block，拼出你的個人主頁——收藏夾、作品集、音樂牆、書架、AI 分身……

所有內容你自己定義，所有排版你自己決定，所有數據你自己持有。
**不需要懂一行程式碼，也能拼出非常好看且高度個人化的主頁。**

但如果你就是想動程式碼——也很好。整套系統是 AGPL-3.0 協議開源的，Fork 它、改造它、把它接到你自己的後端，全部歡迎。

---

## 為什麼選 iNon

市面上的「個人主頁」大多是模板——選個模板、填欄位、套皮膚。表面上是你的，骨子裡不是你定的。

iNon 不一樣。它的核心是 **22 個獨立 Block**，每個 Block 負責展示一類內容。**Block 的拼裝順序、並排/上下、顯示/隱藏，全部由你自己決定。** Block 與 Block 之間不綁死，想加就加、想挪就挪、想藏就藏。

更重要的是——**控制台怎麼擺，公開頁就怎麼呈現**。所見即所得，所設即所得。

---

## 一眼能看到

| 主頁敘事區 |
| --- |
| ![主頁敘事區](images/desktop-home.png) |

| AI 問答提問 | AI 問答回答 |
| --- | --- |
| ![興趣愛好提問](images/desktop-hobby-ask.png) | ![興趣愛好回答](images/desktop-hobby-anwser.png) |
| ![MBTI匹配提問](images/desktop-mbti-ask.png) | ![MBTI匹配問答](images/desktop-mbti-anwser.png) |

| 行動端首頁 | 行動端選單 | 行動端問答 | 行動端星系 |
| --- | --- | --- | --- |
| ![行動端首頁](images/mobile-home.png) | ![行動端選單](images/mobile-menu.png) | ![行動端問答](images/mobile-ask.png) | ![行動端星系](images/mobile-galaxy.png) |

| 音樂卡片 | 電影與書籍書桌 |
| --- | --- |
| ![音樂卡片](images/desktop-music.png) | ![電影卡片](images/desktop-desk.png) |

| 標籤牆 | 深水區 |
| --- | --- |
| ![標籤牆](images/desktop-label.png) | ![進入深水區](images/desktop-into-deepwater.png) |

---

## 誰在用它

- **普通創作者**：只想有一個好看的個人主頁。在線註冊、拖幾個 Block、填點內容、立刻擁有一個能發出去的網址。
- **獨立開發者**：想要一個可 fork、可改、可自部署的開源底座。整個倉庫給你，協議給你，組件給你，你怎麼玩都可以。

---

## 它是怎麼運轉的

```
                        ┌──────────────────────────────┐
                        │        Supabase 數據庫        │
                        │   (Postgres + Auth + Storage) │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │            iNon 核心引擎                    │
                │     (Next.js 16 + React 19 + R3F)           │
                │     ─ Block 註冊表（單一事實源）             │
                │     ─ 畫板拖拽排版引擎                       │
                │     ─ 多主題 + 暗黑模式                      │
                │     ─ AI 分身流式對話                        │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    控制台 /i/:slug      │    │    公開主頁 /:slug      │
          │                         │    │                         │
          │  • 可視化畫板排版        │    │  • 毛玻璃 + 暗黑模式    │
          │  • Block 拖拽 / 排序    │    │  • React Three Fiber    │
          │  • 內容全量 CRUD        │    │    3D 場景（書桌、星系）│
          │  • 多主題即時切換       │    │  • AI 分身懸浮對話      │
          │  • 帳號與安全設定       │    │  • 響應式（行動 / 桌面）│
          │  • 自動儲存              │    │  • 唯讀，所見即所得     │
          └─────────────────────────┘    └─────────────────────────┘
```

後台管理（`/admin`）僅向**超級管理員**開放，專用於資產庫與對象儲存維護。

---

## 22 個 Block：你想展示什麼，就拼什麼

每個 Block 是一類內容的最小展示單元。它們都被同一個**註冊表**統一管理——任何地方看到 Block 標題、圖示，永遠只來自這一處真相。

| Block | 展示內容 |
| --- | --- |
| **個人簡介** (`bio`) | 頭像、姓名、bio、城市定位、年齡進度、社交連結。 |
| **常用網站** (`bookmarks`) | 常用網址與開發工具的網格。 |
| **核心專案** (`projects`) | 單個專案的封面、狀態、摘要、技術棧與跳轉。 |
| **App 啟動** (`app_launcher`) | 應用與工具的捷徑啟動陣列。 |
| **開發工具** (`dev_tools`) | 開發者日常工具集合。 |
| **音樂收藏** (`music`) | 音樂人與專輯網格，支援橫向捲動。 |
| **嘻哈收藏** (`hiphop`) | 獨立於音樂之外的嘻哈作品集合。 |
| **影視收藏** (`movies`) | 影片海報與 3D 書桌聯動。 |
| **書單收藏** (`books`) | 閱讀書桌與書目摘要卡片。 |
| **遊戲收藏** (`games`) | 遊戲網格與互動展示。 |
| **產品收藏** (`products`) | 喜歡的產品、推薦產品、自用硬體。 |
| **個人創作** (`creation`) | 影片、文章、演講、格言與引言匯總。 |
| **時間線** (`timeline`) | 個人里程碑與履歷瀑布流。 |
| **教育背景** (`education`) | 學校、專業、指導教授與學習軌跡。 |
| **工作履歷** (`work`) | 目前工作、過往職位與職業偏好。 |
| **專業技能** (`skills`) | 技術棧與能力標籤。 |
| **Live 現場** (`events`) | 演出、演講、線下活動。 |
| **標籤牆** (`tags`) | 關鍵字、價值觀、習慣、標籤的視覺牆。 |
| **友情連結** (`friend_links`) | 友情連結矩陣。 |
| **聯絡方式** (`contact`) | 留言表單與社交觸點。 |
| **思考** (`thoughts`) | 靈光一現與短篇思考。 |
| **AI 分身** (`ai_clone`) | 以你的檔案為底料的懸浮 AI 對話。 |

加一個新 Block 只改一處：註冊表。新組件加進 `components/blocks/`，註冊表加一行，UI 的所有角落（側欄選單、控制台畫板、公開頁）就都認了。

---

## 關鍵能力

- **畫板式排版** — 在 `/i/:slug` 拖拽、排序、隱藏、調整寬度（單/雙欄），所見即所得。
- **22+ 個 Non Block** — 同一套組件系統同時驅動控制台與公開頁，零重複。
- **多 Slug + 權限設計**
  - `/:slug`：所有人皆可存取的唯讀公開主頁。
  - `/i/:slug`：帳戶所有人的控制台，能寫能改。
  - `/admin`：僅管理員可存取的資產庫。
- **AI 分身** — `/api/assistant` 流式介面，把你的內容檔案轉成系統 Prompt，對接任意 OpenAI 相容模型。
- **沉浸式 3D** — React Three Fiber 書桌、星系、深水區場景，搭配暗色 Canvas 背景。
- **多主題** — 控制台裡即時切換主題與暗色模式，公開頁同步刷新。
- **響應式** — 桌面端 1/2 列自適應，行動端摺疊為單列與懸浮側欄。
- **資產庫** — 全域共用圖床，Block 內的圖片直接上傳，無需外連。
- **自動儲存** — 編輯過程所見即所得，告別「忘記點儲存」。
- **版本號隨提交自動 bump** — 頂欄通知區隨時顯示當前版本。

---

## 技術棧

- **框架**：Next.js 16（App Router、Turbopack、React Server Components、Proxy）
- **語言**：TypeScript 6 + React 19
- **數據庫與認證**：Supabase（Postgres + Auth + Storage，`@supabase/ssr` + `@supabase/supabase-js`）
- **樣式與 UI**：Tailwind CSS 4 + 多主題系統 + Framer Motion + Lucide React
- **三維圖形**：Three.js + React Three Fiber + @react-three/drei
- **狀態與數據**：Zustand、@tanstack/react-query、nuqs
- **表單與校驗**：react-hook-form + Zod
- **主題切換**：next-themes
- **訪問分析**：`@vercel/analytics` + IP 加鹽雜湊

---

## 倉庫結構

```
iNon/
├── app/
│   ├── (home)/                  # 平台首頁（未登入訪客落地）
│   ├── [slug]/                  # 使用者公開主頁 (/:slug)
│   ├── i/[slug]/                # 使用者控制台 (/i/:slug)
│   ├── admin/                   # 後台資產庫 (/admin)
│   ├── login/                   # 登入
│   ├── api/
│   │   ├── assistant/           # AI 分身流式介面
│   │   ├── messages/            # 訪客留言
│   │   ├── account/             # 目前使用者的設定 / 內容 / 布局
│   │   └── admin/               # 管理員側的資源 / 內容 / 上傳 / 刪除
│   ├── layout.tsx
│   └── globals.css              # Tailwind 4 與全域樣式
├── components/
│   ├── blocks/                  # 22 個 Non Block + Canvas 引擎 + 渲染器
│   ├── scenes/                  # React Three Fiber 3D 場景
│   ├── dashboard/               # 控制台 UI（側欄、列表、Card 等）
│   ├── editor/                  # 基於 Schema 的內容編輯器
│   ├── layout/                  # Shell 布局、頂欄、懸浮側欄
│   ├── ai/                      # AI 助手 UI（流式回應）
│   ├── ui/                      # 通用 UI 原子（玻璃擬態、按鈕、表單）
│   ├── BackGround.tsx           # Canvas 動態流動背景
│   └── GlassCard.tsx            # 毛玻璃 UI 原型
├── hooks/                       # 客戶端 hooks（AI / 資產 / 布局 / 時鐘 / 距離）
├── lib/
│   ├── blocks/registry.ts       # Block 單一事實源（標題、圖示）
│   ├── content.ts               # 數據拉取與欄位映射
│   ├── markdown.ts              # 檔案轉 Markdown（AI System Prompt）
│   ├── auth/                    # Supabase 會話、權限、帳號解析
│   ├── supabase/                # Supabase 客戶端與中介層
│   ├── admin/                   # 管理員側 helpers
│   ├── analytics/               # 訪問統計與 IP 雜湊
│   └── utils.ts                 # 工具（距離、年齡、格式化）
├── types/                       # TypeScript 類型（database / layout / index）
├── scripts/                     # 遷移、導庫、校驗、上傳資產、管理員初始化
├── supabase/                    # Supabase 設定與數據庫遷移
├── proxy.ts                     # Next.js Proxy（會話刷新 + 路由保護）
├── components.json              # shadcn 風格組件設定
└── docs/                        # 多語系 README 與介面預覽圖
```

---

## 本地開發

### 前置需求

- Node.js ≥ 20
- pnpm

### 環境變數

參考 `.env.example` 建立 `.env.local`：

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_DISPLAY_NAME=
ANALYTICS_IP_SALT=
```

### 安裝與啟動

```bash
# 安裝依賴
pnpm install

# 啟動 Turbopack 開發伺服器
pnpm dev
```

本地服務運行於 `http://localhost:3000`。

### 常用指令稿

```bash
pnpm db:push             # 推送 Supabase 數據庫遷移
pnpm db:validate         # 校驗數據庫結構與欄位完整性
pnpm db:seed-admin       # 初始化管理員帳號
pnpm db:upload-assets    # 上傳本地資產到 Supabase Storage
pnpm lint                # ESLint
pnpm build               # 生產建置
```

---

## 路線圖

- [x] 數據庫全量遷移至 Supabase（Postgres + Auth + Storage），並提供控制台 CMS
- [x] 可視化畫板拖拽排版引擎（BlockCanvasEngine）
- [x] 22 個 Non Block 透過統一註冊表驅動
- [x] 多主題 + 暗色模式 + Canvas 動態背景
- [x] 資產庫 + Block 圖片直傳
- [x] 自動儲存 + 版本號隨提交自動 bump
- [ ] AI 分身支援多模型路由與訪客上下文記憶
- [ ] 履歷 / 教育 / 產品 3D 場景細節迭代
- [ ] CMS 資產細粒度發布流與留言審核增強

---

## 協議

本項目以 **GNU Affero General Public License v3.0 (AGPL-3.0)** 協議開源。
亦即：**任何 fork 或基於本項目的衍生作品，若透過網路向公眾提供服務，必須以相容協議開源其完整源碼。**

這是為了保證 iNon 永遠是社區的，而不是某一家公司的私有產物。

完整協議正文見倉庫根目錄的 [LICENSE](../LICENSE) 檔案。

---

## 致謝與作者

由 [YingYingDontKill（何錦誠 / Jackson He）](https://github.com/JacksonHe04) 用心維護。
如果它對你有幫助，歡迎 Star、反映、Fork——一切能讓它走得更遠的事情。
