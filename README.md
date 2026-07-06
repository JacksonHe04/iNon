# iNon — Block-Based Personal OS & Digital Garden

> **iNon** — A local-first, customizable, block-based personal workspace and digital garden.
> Powered by Next.js 16, Supabase, React Three Fiber, and a unified atomic component system ("Non").
>
> One personal OS: Console (`/i/:slug`) & Digital Garden (`/:slug`).

🌐 **Read this README in another language:** [English](README.md) · [简体中文](docs/README_ZH_CN.md) · [繁體中文](docs/README_ZH_TW.md) · [日本語](docs/README_JA.md)

## Interface Preview

| Home Narrative |
| --- |
| ![Home Narrative](docs/images/desktop-home.png) |

| AI Q&A Ask | AI Q&A Answer |
| --- | --- |
| ![Hobby Ask](docs/images/desktop-hobby-ask.png) | ![Hobby Answer](docs/images/desktop-hobby-anwser.png) |
| ![MBTI Ask](docs/images/desktop-mbti-ask.png) | ![MBTI Answer](docs/images/desktop-mbti-anwser.png) |

| Mobile Home | Mobile Menu | Mobile Ask | Mobile Galaxy |
| --- | --- | --- | --- |
| ![Mobile Home](docs/images/mobile-home.png) | ![Mobile Menu](docs/images/mobile-menu.png) | ![Mobile Ask](docs/images/mobile-ask.png) | ![Mobile Galaxy](docs/images/mobile-galaxy.png) |

| Music Cards | Film & Book Desk |
| --- | --- |
| ![Music Card](docs/images/desktop-music.png) | ![Film Desk](docs/images/desktop-desk.png) |

| Tag Wall | Deep Space Area |
| --- | --- |
| ![Tag Wall](docs/images/desktop-label.png) | ![Deep Space](docs/images/desktop-into-deepwater.png) |

## System Architecture

```
                        ┌──────────────────────────────┐
                        │        Supabase DB           │
                        │ (Postgres + Auth + Storage)  │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │             iNon Core System                │
                │     (Next.js 16 + React 19 + R3F)           │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │     Console /i/:slug    │    │    Public Site /:slug   │
          │                         │    │                         │
          │ • Home (Bookmarks & AI) │    │ • Glassmorphism Design  │
          │ • Content CRUD Manager  │    │ • 3D Desk & R3F Galaxy  │
          │ • Block Canvas Builder  │    │ • Dynamic Non Blocks    │
          │ • Account Settings      │    │ • AI Avatar Assistant   │
          └─────────────────────────┘    └─────────────────────────┘
```

## What it is

iNon elevates personal website creation into a **block-based operating system**. It seamlessly drives both the private workspace console (`/i/:slug`) and the public digital showcase (`/:slug`) using a unified component architecture. Users can effortlessly customize their content, layout structure, media collections, bookmarks, and AI avatar assistant.

## Key Features

- **Block-Based OS ("Non" System)**: Modular component architecture driving both personal dashboard and public site.
- **Visual Canvas Builder**: Real-time canvas engine (`BlockCanvasEngine`) supporting drag-and-drop reordering, visibility toggle, and responsive column sizing (50% / 100% width).
- **Multi-Slug & Permission Design**:
  - `/:slug`: Public read-only digital garden accessible to guests.
  - `/i/:slug`: Private dashboard for account owner to edit content, layout, and settings.
  - `/admin`: Superadmin asset library & object storage manager.
- **AI Avatar Assistant**: Built-in `/api/assistant` streaming GLM / LLM model responses populated by user markdown knowledge base.
- **Immersive 3D & Micro-Animations**: React Three Fiber 3D interactive desks, creation galaxies, dynamic Canvas background, dark mode, and Framer Motion transitions.

## Atomic Definition: Non Components

iNon defines system capabilities through granular, reusable "Non" atomic blocks:

| Block Component | Description |
| --- | --- |
| **Bio Header** (`BioHeaderBlock`) | Profile avatar, name, bio, city distance calculator, age progress bar, and social links. |
| **Website Bookmarks** (`BookmarkBlock`) | Quick launch web shortcuts and dev tool grid. |
| **Project Showcase** (`ProjectBlock`) | Rich project cards with covers, tech stack badges, status, and quick links. |
| **Music Card** (`MusicBlock`) | Artist & album collection grid with horizontal scroll. |
| **Movie Posters** (`MovieBlock`) | Film wall and 3D desk scene integrations. |
| **Bookshelf** (`BookBlock`) | Reading desk and book summary cards. |
| **Game Collection** (`GameBlock`) | Gaming library and interactive shelf. |
| **AI Avatar Entrance** (`AiCloneBlock`) | Floating AI dialog & streaming assistant interface. |
| **Activity Timeline** (`TimelineBlock`) | Public personal milestones and career waterfall. |
| **Friend Links** (`FriendLinkBlock`) | Interactive friend link matrix. |
| **Contact Card** (`ContactBlock`) | Direct message form and social touchpoints. |
| **App Launcher** (`AppLauncherBlock`) | Application launcher and utility tool matrix. |

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 6 + React 19
- **Database & Auth**: Supabase Postgres + Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling & UI**: Tailwind CSS 4 + Glassmorphism design system + Framer Motion
- **3D Graphics**: Three.js + React Three Fiber + @react-three/drei
- **State & Utilities**: Zustand, TanStack React Query, Nuqs, Zod, Lucide React

## Project Structure

```
iNon/
├── app/
│   ├── [slug]/                  # Public user page (/:slug)
│   ├── i/                       # Private user dashboard (/i/:slug)
│   ├── admin/                   # Asset library manager (/admin)
│   ├── api/assistant/route.ts   # AI assistant streaming route
│   └── globals.css              # Tailwind 4 & global styles
├── components/
│   ├── blocks/                  # "Non" atomic block components & canvas engine
│   ├── scenes/                  # React Three Fiber 3D scenes (ProductDesk, Galaxy, etc.)
│   ├── dashboard/               # Console UI components (/i/:slug)
│   ├── editor/                  # Visual content block editors
│   ├── layout/                  # Shell layouts, top nav, side nav
│   ├── BackGround.tsx           # Dynamic Canvas background
│   └── GlassCard.tsx            # Glassmorphism UI primitive
├── data/readme.json             # Seed data & backup snapshot
├── lib/
│   ├── auth/                    # Supabase session & permission helpers
│   ├── content.ts               # Data fetching & schema mapping
│   ├── markdown.ts              # Knowledge base to Markdown generator for AI
│   └── utils.ts                 # Location/distance/age helpers
├── supabase/                    # Schema migrations & Supabase config
├── scripts/                     # Seed admin, asset upload, data validation scripts
├── types/                       # TypeScript interfaces & layout definitions
└── docs/                        # Multi-language README documentation & images
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm (recommended)

### Environment Setup

Create `.env.local` based on `.env.example`:

```env
OPENAI_API_KEY=your_openai_or_zhipu_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start local development server with Turbopack
pnpm dev

# Lint & build
pnpm lint
pnpm build
```

The application will run locally at `http://localhost:3000`.

### Database Scripts

```bash
# Push database migrations to Supabase
pnpm db:push

# Import seed json data into Supabase
pnpm db:import

# Validate database contents against schema
pnpm db:validate

# Seed initial admin user
pnpm db:seed-admin
```

## Roadmap

- [x] Runtime migration to Supabase Postgres & Storage with CMS console.
- [x] Visual block canvas layout builder (`BlockCanvasEngine`) with drag-and-drop support.
- [x] Full Non component system rollout (14+ atomic blocks).
- [ ] 3D scene refinements for Education & Experience waterfall.
- [ ] Multi-agent memory support and context upload for AI Avatar.
- [ ] Granular asset publishing pipeline and moderation.

## License

[MIT](LICENSE)

## Author

[YingYingDontKill (Jackson He)](https://github.com/JacksonHe04)
