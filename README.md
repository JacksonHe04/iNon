# iNon — Block by Block, Build a Personal Site You Truly Own

> **iNon** — A block-based personal OS that lets your personal site truly belong to you.
> *Open source. Infinitely customizable. Effortless to use.*
>
> One personal OS: the Console (`/i/:slug`) and the Digital Garden (`/:slug`).

[English](README.md) · [简体中文](docs/README_ZH_CN.md) · [繁體中文](docs/README_ZH_TW.md) · [日本語](docs/README_JA.md)

---

## What it is

iNon is an **open-source, infinitely customizable** personal site system.
You **drag blocks into place like Lego** to assemble your homepage — bookmarks, projects, music walls, bookshelves, AI avatar, and whatever else you want to share.

You define the content. You decide the layout. You own the data.
**No code required** to build something beautiful and deeply personal.

But if you *do* want to dig into the code — even better. The whole system ships under AGPL-3.0. Fork it, modify it, wire it to your own backend — all welcome.

---

## Why iNon

Most "personal sites" out there are templates — pick one, fill in the blanks, apply a skin. They look like yours on the surface, but they aren't really *yours* underneath.

iNon is different. At its core are **22 independent blocks**, each handling one kind of content. **You choose which blocks appear, in what order, side-by-side or stacked.** Blocks aren't locked together; add, reorder, hide — whatever.

And there's the catch that matters most: **whatever you lay out in the Console is what visitors see on the public page.** WYSIWYG. WYSISYG.

---

## At a glance

| Home narrative |
| --- |
| ![Home narrative](docs/images/desktop-home.png) |

| AI Q&A — Ask | AI Q&A — Answer |
| --- | --- |
| ![Hobby Ask](docs/images/desktop-hobby-ask.png) | ![Hobby Answer](docs/images/desktop-hobby-anwser.png) |
| ![MBTI Ask](docs/images/desktop-mbti-ask.png) | ![MBTI Answer](docs/images/desktop-mbti-anwser.png) |

| Mobile home | Mobile menu | Mobile ask | Mobile galaxy |
| --- | --- | --- | --- |
| ![Mobile Home](docs/images/mobile-home.png) | ![Mobile Menu](docs/images/mobile-menu.png) | ![Mobile Ask](docs/images/mobile-ask.png) | ![Mobile Galaxy](docs/images/mobile-galaxy.png) |

| Music cards | Films & books desk |
| --- | --- |
| ![Music Card](docs/images/desktop-music.png) | ![Film Desk](docs/images/desktop-desk.png) |

| Tag wall | Deep space |
| --- | --- |
| ![Tag Wall](docs/images/desktop-label.png) | ![Deep Space](docs/images/desktop-into-deepwater.png) |

---

## Who it's for

- **Everyday creators** who just want a good-looking personal site. Sign up online, drag in a few blocks, fill them in, and immediately have a shareable URL that looks like *you*.
- **Independent developers** who want an open-source base they can fork, change, and self-host. The full repo, the license, the components — all yours to play with.

---

## How it works

```
                        ┌──────────────────────────────┐
                        │         Supabase (DB)        │
                        │  (Postgres + Auth + Storage) │
                        └──────────────┬───────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │            iNon Core Engine                │
                │     (Next.js 16 + React 19 + R3F)           │
                │     — Block Registry (single source of truth)│
                │     — Visual canvas layout engine           │
                │     — Multi-theme + dark mode               │
                │     — Streaming AI avatar                   │
                └──────┬──────────────────────────────┬───────┘
                       │                              │
          ┌────────────▼────────────┐    ┌────────────▼────────────┐
          │    Console /i/:slug     │    │   Public Site /:slug   │
          │                         │    │                         │
          │  • Visual canvas layout │    │  • Glassmorphism +      │
          │  • Block drag & reorder │    │    dark mode            │
          │  • Full content CRUD    │    │  • React Three Fiber    │
          │  • Live theme switching │    │    3D scenes            │
          │  • Account & security   │    │  • Floating AI avatar   │
          │  • Auto-save             │    │  • Responsive (mobile)  │
          └─────────────────────────┘    └─────────────────────────┘
```

Admin (`/admin`) is restricted to **superadmins** and handles asset / object-storage maintenance only.

---

## 22 blocks: assemble whatever you want to show

Each block is the smallest unit of one kind of content. They all share a single **registry** as the source of truth — every title, every icon, everywhere, comes from this one place.

| Block | What it shows |
| --- | --- |
| **Bio Header** (`bio`) | Avatar, name, bio, current city, age progress, social links. |
| **Bookmarks** (`bookmarks`) | Grid of favorite URLs and dev tools. |
| **Projects** (`projects`) | Cover, status, summary, tech stack, quick jump for each project. |
| **App Launcher** (`app_launcher`) | Quick-launch grid of apps and tools. |
| **Dev Tools** (`dev_tools`) | Day-to-day developer tools. |
| **Music** (`music`) | Artists and albums grid, horizontal scroll supported. |
| **Hip-hop** (`hiphop`) | Hip-hop collection, distinct from general music. |
| **Movies** (`movies`) | Film wall, paired with 3D desk scenes. |
| **Books** (`books`) | Reading desk and book summary cards. |
| **Games** (`games`) | Game grid and interactive shelf. |
| **Products** (`products`) | Favorite products, recommendations, hardware you use. |
| **Creations** (`creation`) | Videos, articles, talks, mottos, and quotes together. |
| **Timeline** (`timeline`) | Personal milestones and career waterfall. |
| **Education** (`education`) | Schools, majors, advisors, learning journey. |
| **Work** (`work`) | Current job, past roles, work preferences. |
| **Skills** (`skills`) | Tech stack and capability tags. |
| **Live Events** (`events`) | Performances, talks, in-person meetups. |
| **Tag Wall** (`tags`) | Keywords, values, habits, tags as a visual wall. |
| **Friend Links** (`friend_links`) | Friend link matrix. |
| **Contact** (`contact`) | Message form and social touchpoints. |
| **Thoughts** (`thoughts`) | Quick sparks and short reflections. |
| **AI Avatar** (`ai_clone`) | Floating AI chat fed by your own profile. |

Adding a new block is a one-place change: register it. Drop the component into `components/blocks/`, add one line to the registry, and every UI corner — sidebar menu, console canvas, public page — picks it up.

---

## Key capabilities

- **Canvas-style layout** — drag, reorder, hide, and adjust column width (single / half-and-half) right in `/i/:slug`. WYSIWYG.
- **22+ Non Blocks** — a single component system drives both the Console and the public site, zero duplication.
- **Multi-slug + Permissions**
  - `/:slug` — public, read-only homepage, accessible to anyone.
  - `/i/:slug` — owner's Console: read, write, edit.
  - `/admin` — asset library, admin-only.
- **AI Avatar** — `/api/assistant` is a streaming endpoint that turns your content profile into a system prompt, pluggable into any OpenAI-compatible model.
- **Immersive 3D** — React Three Fiber desk, galaxy, and deep-space scenes with a dynamic canvas background.
- **Multi-theme** — switch themes and dark mode live in the Console; the public page follows instantly.
- **Responsive** — 1 / 2-column adaptive on desktop; collapses to single column and a floating sidebar on mobile.
- **Asset Library** — shared image bed; upload images directly inside blocks, no external host needed.
- **Auto-save** — edits persist as you go; goodbye "I forgot to save".
- **Version bumps on commit** — the current version is always visible on the top nav.

---

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack, React Server Components, Proxy)
- **Language**: TypeScript 6 + React 19
- **Database & Auth**: Supabase (Postgres + Auth + Storage, `@supabase/ssr` + `@supabase/supabase-js`)
- **Styling & UI**: Tailwind CSS 4 + multi-theme system + Framer Motion + Lucide React
- **3D**: Three.js + React Three Fiber + @react-three/drei
- **State & Data**: Zustand, @tanstack/react-query, nuqs
- **Forms & Validation**: react-hook-form + Zod
- **Theming**: next-themes
- **Analytics**: `@vercel/analytics` + salted IP hashing

---

## Repository layout

```
iNon/
├── app/
│   ├── (home)/                  # Platform landing page (guests)
│   ├── [slug]/                  # Public user page (/:slug)
│   ├── i/[slug]/                # Console (/i/:slug)
│   ├── admin/                   # Asset library (/admin)
│   ├── login/                   # Sign-in
│   ├── api/
│   │   ├── assistant/           # AI avatar streaming endpoint
│   │   ├── messages/            # Visitor messages
│   │   ├── account/             # Settings / content / layout for current user
│   │   └── admin/               # Asset / content / upload / delete for admins
│   ├── layout.tsx
│   └── globals.css              # Tailwind 4 + global styles
├── components/
│   ├── blocks/                  # 22 Non Blocks + canvas engine + renderer
│   ├── scenes/                  # React Three Fiber 3D scenes
│   ├── dashboard/               # Console UI (sidebar, lists, cards)
│   ├── editor/                  # Schema-driven content editors
│   ├── layout/                  # Shell layout, top nav, floating sidebar
│   ├── ai/                      # AI avatar UI (streaming response)
│   ├── ui/                      # Generic UI atoms (glass, buttons, inputs)
│   ├── BackGround.tsx           # Dynamic flowing canvas background
│   └── GlassCard.tsx            # Glassmorphism primitive
├── hooks/                       # Client hooks (AI / assets / layout / clock / distance)
├── lib/
│   ├── blocks/registry.ts       # Block single source of truth (titles, icons)
│   ├── content.ts               # Data fetch and field mapping
│   ├── markdown.ts              # Profile → Markdown (AI system prompt)
│   ├── auth/                    # Supabase session, permissions, username lookup
│   ├── supabase/                # Supabase clients and middleware
│   ├── admin/                   # Admin helpers
│   ├── analytics/               # Analytics + IP hashing
│   └── utils.ts                 # utilities (distance, age, formatting)
├── types/                       # TypeScript types (database / layout / index)
├── scripts/                     # migrations, import, validate, upload, admin seed
├── supabase/                    # Supabase config + migrations
├── proxy.ts                     # Next.js Proxy (session refresh + route protection)
├── components.json              # shadcn-style component config
└── docs/                        # Multi-language READMEs + UI preview images
```

---

## Local development

### Prerequisites

- Node.js ≥ 20
- pnpm

### Environment

Copy `.env.example` to `.env.local`:

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_DISPLAY_NAME=
ANALYTICS_IP_SALT=
```

### Install & run

```bash
# Install dependencies
pnpm install

# Start dev server (Turbopack)
pnpm dev
```

Local server runs at `http://localhost:3000`.

### Useful scripts

```bash
pnpm db:push             # Push Supabase migrations
pnpm db:validate         # Validate DB schema and field integrity
pnpm db:seed-admin       # Seed initial admin account
pnpm db:upload-assets    # Upload local assets to Supabase Storage
pnpm lint                # ESLint
pnpm build               # Production build
```

---

## Roadmap

- [x] Full migration to Supabase (Postgres + Auth + Storage) with Console CMS
- [x] Visual canvas drag layout engine (`BlockCanvasEngine`)
- [x] 22 Non Blocks driven by a unified registry
- [x] Multi-theme + dark mode + dynamic canvas background
- [x] Asset library + direct image upload in blocks
- [x] Auto-save + version bumps on commit
- [ ] AI avatar with multi-model routing and visitor context memory
- [ ] Iteration on Work / Education / Products 3D scene detail
- [ ] Granular asset publishing pipeline and visitor message moderation

---

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
In short: **any fork or derivative work that is made available to the public over a network must release its complete corresponding source code under a compatible license.**

This is so that iNon stays a community thing forever, not a private asset of any one company.

The full license text is available in the [LICENSE](LICENSE) file at the repository root.

---

## Author

Crafted and maintained by [YingYingDontKill (Jackson He)](https://github.com/JacksonHe04).
If it helps you, a Star, feedback, or Fork is the kindest thing you can do — anything that keeps it moving forward.
