# iNon — 基於 Block 的個人操作系統與數位花園

> **iNon** — 一個本地優先、高度可自訂的 Block 個人操作系統與數位花園。
> 基於 Next.js 16、Supabase、React Three Fiber 以及統一的原子組件系統（"Non"）構建。
>
> 一個個人 OS：控制台（`/i/:slug`）與數位花園（`/:slug`）。

🌐 **其他語言版本：** [English](../README.md) · [簡體中文](README_ZH_CN.md) · [繁體中文](README_ZH_TW.md) · [日本語](README_JA.md)

## 介面預覽

| 主頁敘事區 |
| --- |
| ![主頁敘事區](images/desktop-home.png) |

| AI 問答提問 | AI 問答回答 |
| --- | --- |
| ![興趣愛好提問](images/desktop-hobby-ask.png) | ![興趣愛好回答](images/desktop-hobby-anwser.png) |
| ![MBTI匹配提問](images/desktop-mbti-ask.png) | ![MBTI匹配問答](images/desktop-mbti-anwser.png) |

| 行動端首頁 | 行動端菜單 | 行動端問答 | 行動端星系 |
| --- | --- | --- | --- |
| ![行動端首頁](images/mobile-home.png) | ![行動端菜單](images/mobile-menu.png) | ![行動端問答](images/mobile-ask.png) | ![行動端星系](images/mobile-galaxy.png) |

| 音樂卡片 | 電影與書籍書桌 |
| --- | --- |
| ![音樂卡片](images/desktop-music.png) | ![電影卡片](images/desktop-desk.png) |

| 標籤牆 | 深水區 |
| --- | --- |
| ![標籤牆](images/desktop-label.png) | ![進入深水區](images/desktop-into-deepwater.png) |

## 系統架構

```
                        ┌──────────────────────────────┐
                        │        Supabase 資料庫       │
                        │ (Postgres + Auth + Storage)  │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │             iNon 核心系統                   │
                │     (Next.js 16 + React 19 + R3F)           │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    控制台 /i/:slug      │    │    公開主頁 /:slug      │
          │                         │    │                         │
          │ • 主頁 (快捷入口與 AI)  │    │ • 毛玻璃沉浸設計        │
          │ • 內容全量 CRUD 管理    │    │ • 3D 書桌與 R3F 星系    │
          │ • 畫板拖拽排版引擎      │    │ • 動態 Non 模組         │
          │ • 帳號與安全設置        │    │ • AI 分身助手           │
          └─────────────────────────┘    └─────────────────────────┘
```

## 它是什麼

iNon 將傳統的個人網站搭建升級為一個 **block-based 的個人操作系統**。它透過統一的組件架構同時驅動個人控制台（`/i/:slug`）與公開數位花園（`/:slug`）。使用者可在控制台中輕鬆管理個人檔案、開發專案、網頁快捷入口、影音收藏以及 AI 分身對話，並向訪客展示兼具 3D 與毛玻璃質感的個人主頁。

## 核心亮點

- **基於 Block 的操作系統（"Non" 系統）**：統一的模組化組件體系，同時驅動私有工作區與公開展示頁。
- **畫板拖拽排版引擎**：在 `/i/:slug` 中提供即時拖拽畫布（`BlockCanvasEngine`），支援區塊排序、顯示/隱藏切換及響應式單雙欄調整（50% / 100% 寬度），效果與公開頁一致。
- **多 Slug 與權限設計**：
  - `/:slug`：所有人均可訪問的唯讀個人公開數位花園。
  - `/i/:slug`：僅帳戶所有人可見可寫的控制台，用於編輯內容、排版及帳號設定。
  - `/admin`：僅超級管理員可訪問的資產庫與物件存儲管理頁。
- **AI 分身助手**：內建 `/api/assistant` 路由，將本地個人檔案轉化為 Markdown Prompt，串流對接智譜 GLM / 大模型提供即時問答。
- **沉浸式 3D 與微互動**：集成 React Three Fiber 3D 場景（產品書桌、創作星系等）、Canvas 動態背景、暗黑模式及 Framer Motion 平滑過渡。

## 原子定義：Non 組件

iNon 採用粒度明確的 "Non" 原子組件定義系統功能上限：

| 模組組件 | 描述 |
| --- | --- |
| **個人簡介卡** (`BioHeaderBlock`) | 頭像、姓名、bio、城市定位距離計算、年齡進度條與社交連結。 |
| **網站收藏夾** (`BookmarkBlock`) | 常用網站網格與開發工具快捷入口。 |
| **專案卡片** (`ProjectBlock`) | 單個專案的封面、狀態、摘要、技術棧標籤與快速跳轉。 |
| **音樂卡片** (`MusicBlock`) | 音樂人與專輯收藏網格，支援橫向滾動。 |
| **影片海報牆** (`MovieBlock`) | 影片網格與 3D 書桌聯動。 |
| **書架** (`BookBlock`) | 閱讀書桌與書目摘要卡片。 |
| **遊戲收藏** (`GameBlock`) | 遊戲網格與互動展示。 |
| **AI 分身入口** (`AiCloneBlock`) | 懸浮 AI 對話與串流助手互動介面。 |
| **動態時間線** (`TimelineBlock`) | 公開的個人里程碑與履歷瀑布流。 |
| **友鏈** (`FriendLinkBlock`) | 友情連結互動網格。 |
| **聯繫卡片** (`ContactBlock`) | 留言表單與社交觸點。 |
| **應用啟動器** (`AppLauncherBlock`) | 常用應用與工具快捷啟動陣列。 |

## 技術棧

- **框架**：Next.js 16 (App Router, Turbopack)
- **語言**：TypeScript 6 + React 19
- **資料庫與驗證**：Supabase Postgres + Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **樣式與 UI**：Tailwind CSS 4 + 毛玻璃設計系統 + Framer Motion
- **三維圖形**：Three.js + React Three Fiber + @react-three/drei
- **狀態與工具**：Zustand, TanStack React Query, Nuqs, Zod, Lucide React

## 專案結構

```
iNon/
├── app/
│   ├── [slug]/                  # 使用者公開主頁 (/:slug)
│   ├── i/                       # 使用者控制台 (/i/:slug)
│   ├── admin/                   # 後台資產庫管理 (/admin)
│   ├── api/assistant/route.ts   # AI 助手串流路由
│   └── globals.css              # Tailwind 4 與全域樣式
├── components/
│   ├── blocks/                  # "Non" 原子組件與畫板引擎
│   ├── scenes/                  # React Three Fiber 3D 場景 (ProductDesk, Galaxy等)
│   ├── dashboard/               # 控制台 UI 組件 (/i/:slug)
│   ├── editor/                  # 內容 Block 全量編輯組件
│   ├── layout/                  # Shell 佈局、頂欄、側欄
│   ├── BackGround.tsx           # Canvas 動態流動背景
│   └── GlassCard.tsx            # 毛玻璃 UI 原型
├── data/readme.json             # 種子資料與備份快照
├── lib/
│   ├── auth/                    # Supabase 會話與權限工具
│   ├── content.ts               # 資料拉取與 Schema 映射
│   ├── markdown.ts              # 檔案轉 Markdown (AI System Prompt)
│   └── utils.ts                 # 定位、距離與年齡計算函數
├── supabase/                    # Schema 遷移與 Supabase 配置
├── scripts/                     # 導庫、校驗、資產上傳與管理員初始化腳本
├── types/                       # TypeScript 類型與 Layout 配置定義
└── docs/                        # 多語言 README 文檔與預覽圖片
```

## 本地開發指南

### 前置要求

- Node.js ≥ 20
- pnpm（推薦）

### 環境變數配置

參考 `.env.example` 創建 `.env.local` 檔案：

```env
OPENAI_API_KEY=your_openai_or_zhipu_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### 安裝與運行

```bash
# 安裝依賴
pnpm install

# 啟動 Turbopack 本地開發伺服器
pnpm dev

# 程式碼檢查與生產構建
pnpm lint
pnpm build
```

本地服務預設運行在 `http://localhost:3000`。

### 資料庫常用腳本

```bash
# 推送 Supabase 資料庫 Migration
pnpm db:push

# 導入 JSON 資料至 Supabase
pnpm db:import

# 校驗資料庫結構與欄位完整性
pnpm db:validate

# 初始化管理員帳號
pnpm db:seed-admin
```

## 路線圖

- [x] 運行時資料全量遷移至 Supabase Postgres & Storage 並提供後台 CMS。
- [x] 可視化 Block 畫板拖拽排版引擎（`BlockCanvasEngine`）。
- [x] 完善 Non 組件系統（14+ 原子 Block）。
- [ ] 履歷與教育星系的 3D 場景細節迭代。
- [ ] AI 分身支援多模型策略與訪客上下文記憶。
- [ ] CMS 資產細粒度發佈流與留言審核增強。

## 開源許可證

[MIT](LICENSE)

## 作者

[YingYingDontKill (何錦誠 / Jackson He)](https://github.com/JacksonHe04)
