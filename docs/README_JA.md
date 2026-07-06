# iNon — Block ベースのパーソナル OS & デジタルガーデン

> **iNon** — ローカルファーストで高度にカスタマイズ可能な Block ベースのパーソナルワークスペース & デジタルガーデン。
> Next.js 16、Supabase、React Three Fiber、そして統一されたアトミックコンポーネントシステム（"Non"）によって構築されています。
>
> 1つのパーソナル OS: コンソール (`/i/:slug`) & デジタルガーデン (`/:slug`)。

🌐 **他の言語で読む:** [English](../README.md) · [简体中文](README_ZH_CN.md) · [繁體中文](README_ZH_TW.md) · [日本語](README_JA.md)

## インターフェースプレビュー

| ホームストーリー領域 |
| --- |
| ![ホームストーリー領域](images/desktop-home.png) |

| AI 質問 | AI 回答 |
| --- | --- |
| ![趣味の質問](images/desktop-hobby-ask.png) | ![趣味の回答](images/desktop-hobby-anwser.png) |
| ![MBTIの質問](images/desktop-mbti-ask.png) | ![MBTIの回答](images/desktop-mbti-anwser.png) |

| モバイルホーム | モバイルメニュー | モバイル Q&A | モバイル銀河 |
| --- | --- | --- | --- |
| ![モバイルホーム](images/mobile-home.png) | ![モバイルメニュー](images/mobile-menu.png) | ![モバイル Q&A](images/mobile-ask.png) | ![モバイル銀河](images/mobile-galaxy.png) |

| 音楽カード | 映画・書籍デスク |
| --- | --- |
| ![音楽カード](images/desktop-music.png) | ![映画デスク](images/desktop-desk.png) |

| タグウォール | ディープスペースエリア |
| --- | --- |
| ![タグウォール](images/desktop-label.png) | ![ディープスペース](images/desktop-into-deepwater.png) |

## システムアーキテクチャ

```
                        ┌──────────────────────────────┐
                        │        Supabase DB           │
                        │ (Postgres + Auth + Storage)  │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │             iNon コアシステム               │
                │     (Next.js 16 + React 19 + R3F)           │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    コンソール /i/:slug   │    │   公開ページ /:slug     │
          │                         │    │                         │
          │ • ホーム (ブックマーク&AI)│    │ • グラスモーフィズムデザイン │
          │ • 全コンテンツ CRUD 管理 │    │ • 3D デスク & R3F 銀河   │
          │ • ドラッグ＆ドロップキャンバス│    │ • 動的 Non ブロック     │
          │ • アカウント & セキュリティ │    │ • AI アバターアシスタント│
          └─────────────────────────┘    └─────────────────────────┘
```

## iNon とは

iNon は、従来の個人ウェブサイト構築を **Block ベースのパーソナルオペレーティングシステム** へと進化させます。統一されたコンポーネントアーキテクチャにより、プライベートワークスペースコンソール (`/i/:slug`) と公開デジタルガーデン (`/:slug`) の両方をシームレスに駆動します。ユーザーは個人プロフィール、プロジェクト、ブックマーク、メディアコレクション、AI アバターをコンソールで容易に管理・配置できます。

## 主な特徴

- **Block ベース OS ("Non" システム)**: プライベートコンソールと公開展示ページの両方を駆動するモジュール式コンポーネントアーキテクチャ。
- **視覚的キャンバスビルダー**: ドラッグ＆ドロップによる並べ替え、表示/非表示の切り替え、レスポンシブな 1/2 カラム幅（50% / 100%）調整をサポートするリアルタイムキャンバスエンジン (`BlockCanvasEngine`)。
- **マルチ Slug & 権限設計**:
  - `/:slug`: 誰でもアクセス可能な閲覧専用のデジタルガーデン。
  - `/i/:slug`: アカウント所有者専用の編集コンソール。
  - `/admin`: スーパー管理者専用のアセットライブラリ & ストレージ管理。
- **AI アバターアシスタント**: ユーザーのナレッジベース（Markdown）を読み込み、リアルタイムで応答をストリーミング出力する `/api/assistant` ルートを内蔵。
- **没入型 3D & ミクロアニメーション**: React Three Fiber 3D インタラクティブデスク、クリエイションギャラクシー、Canvas 動的背景、ダークモード、Framer Motion トランジション。

## 原子定義: Non コンポーネント

iNon は、粒度の揃った再利用可能な "Non" アトミックブロックによってシステムの機能を定義します：

| ブロックコンポーネント | 説明 |
| --- | --- |
| **プロフィール** (`BioHeaderBlock`) | アバター、名前、Bio、都市間距離計算、年齢プログレスバー、SNS リンク。 |
| **ブックマーク** (`BookmarkBlock`) | Web ショートカット & 開発ツールグリッド。 |
| **プロジェクト** (`ProjectBlock`) | カバー画像、技術スタックバッジ、ステータス、リンク付きプロジェクトカード。 |
| **音楽** (`MusicBlock`) | アーティスト & アルバムコレクション（横スクロール対応）。 |
| **映画** (`MovieBlock`) | 映画ポスターウォール & 3D デスク連携。 |
| **本棚** (`BookBlock`) | 読書デスク & 書籍サマリーカード。 |
| **ゲーム** (`GameBlock`) | ゲームライブラリ & インタラクティブ棚。 |
| **AI アバター** (`AiCloneBlock`) | フローティング AI ダイアログ & ストリーミングアシスタント。 |
| **タイムライン** (`TimelineBlock`) | マイルストーン & 経歴ウォーターフォール。 |
| **友情リンク** (`FriendLinkBlock`) | インタラクティブな相互リンクマトリクス。 |
| **コンタクト** (`ContactBlock`) | メッセージフォーム & ソーシャルタッチポイント。 |
| **アプリランチャー** (`AppLauncherBlock`) | アプリケーションランチャー & ツールマトリクス。 |

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router, Turbopack)
- **言語**: TypeScript 6 + React 19
- **データベース & 認証**: Supabase Postgres + Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **スタイリング & UI**: Tailwind CSS 4 + グラスモーフィズムデザインシステム + Framer Motion
- **3D グラフィックス**: Three.js + React Three Fiber + @react-three/drei
- **状態管理 & ユーティリティ**: Zustand, TanStack React Query, Nuqs, Zod, Lucide React

## ディレクトリ構造

```
iNon/
├── app/
│   ├── [slug]/                  # 公開ユーザーページ (/:slug)
│   ├── i/                       # ユーザーコンソール (/i/:slug)
│   ├── admin/                   # アセット管理ページ (/admin)
│   ├── api/assistant/route.ts   # AI アシスタントストリーミングルート
│   └── globals.css              # Tailwind 4 & グローバルスタイル
├── components/
│   ├── blocks/                  # "Non" アトミックブロック & キャンバスエンジン
│   ├── scenes/                  # React Three Fiber 3D シーン (ProductDesk, Galaxyなど)
│   ├── dashboard/               # コンソール UI コンポーネント (/i/:slug)
│   ├── editor/                  # コンテンツ編集コンポーネント
│   ├── layout/                  # シェルレイアウト、トップナビ、サイドナビ
│   ├── BackGround.tsx           # Canvas 動的背景
│   └── GlassCard.tsx            # グラスモーフィズム UI 原型
├── data/readme.json             # シードデータ & バックアップスナップショット
├── lib/
│   ├── auth/                    # Supabase セッション & 権限ヘルパー
│   ├── content.ts               # データ取得 & Schema マッピング
│   ├── markdown.ts              # ナレッジベース Markdown 変換
│   └── utils.ts                 # 距離・年齢計算ヘルパー
├── supabase/                    # Schema マイグレーション & Supabase 設定
├── scripts/                     # シードインポート、データ検証、アセットアップロード
├── types/                       # TypeScript 型定義 & Layout 設定
└── docs/                        # 多言語 README ドキュメント & 画像
```

## ローカル開発手順

### 開発要件

- Node.js ≥ 20
- pnpm（推奨）

### 環境変数の設定

`.env.example` を参考に `.env.local` を作成します：

```env
OPENAI_API_KEY=your_openai_or_zhipu_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### インストールと起動

```bash
# 依存関係のインストール
pnpm install

# Turbopack によるローカル開発サーバーの起動
pnpm dev

# コードチェック & プロダクションビルド
pnpm lint
pnpm build
```

ローカルサーバーは `http://localhost:3000` で実行されます。

### データベーススクリプト

```bash
# Supabase へ DB マイグレーションを適用
pnpm db:push

# JSON データを Supabase にインポート
pnpm db:import

# データベース内容のバリデーション
pnpm db:validate

# 管理者ユーザーの初期化
pnpm db:seed-admin
```

## ロードマップ

- [x] Supabase Postgres & Storage への移行と CMS コンソールの構築。
- [x] ドラッグ＆ドロップ対応の視覚的 Block キャンバスビルダー (`BlockCanvasEngine`)。
- [x] Non コンポーネントシステムの拡張 (14+ アトミック Block)。
- [ ] 経歴・教育銀河の 3D シーン詳細アップデート。
- [ ] AI アバターにおけるマルチモデル対応およびコンテキスト記憶。
- [ ] アセットパブリッシングパイプラインとモデレーション機能。

## ライセンス

[MIT](LICENSE)

## 作者

[YingYingDontKill (何錦誠 / Jackson He)](https://github.com/JacksonHe04)
