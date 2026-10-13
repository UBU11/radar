## 1. Project Overview & Core Purpose
**Project Name:** Radar (Campus Prediction Market & Local-First Meetup Platform)
**Goal:** A high-throughput prediction market with a live anonymous chat attached to every poll, funneling into a private, offline-first 24-hour physical meetup protocol.
**Stack:** Next.js (App Router, React 19), Tailwind CSS v4, Shadcn/ui with cult ui, Supabase (PostgreSQL, Auth, Realtime), PowerSync/SQLite (Local-first CRDTs), Cloudflare Workers + Hono + Upstash Redis (Betting Engine), Vercel AI SDK + Groq AI + Zod (Moderation).

## 2. Architecture Boundaries & Constraints
### Always Do:
- **Use TypeScript strictly.** Type all Supabase payloads using the generated database schema. Wrap all Server Actions and API route inputs in `zod` schemas before processing.
- **Implement Local-First Sync.** The Meetup Split-Key feature must function offline. Use PowerSync to cache state in SQLite/IndexedDB on the device. Resolve conflicts using CRDTs when the device reconnects.
- **Use Atomic Transactions for Bets.** Never update a user's credit balance using a Read-Modify-Write pattern on the client or server. Always use atomic PostgreSQL `UPDATE users SET balance = balance - X` queries to prevent race conditions.
- **Keep Client Components Minimal.** Default to React Server Components (RSC) to ship raw HTML. Only use `"use client"` for interactive UI (e.g., placing a bet, live odds WebSockets, Framer Motion animations).
- **Use Monospace Fonts for Data.** Any live, updating number (betting odds, countdown timers, credit balances) must be wrapped in a monospace font utility to prevent horizontal UI jitter during WebSocket updates.

### Ask First:
- Before running any destructive Supabase database migrations or altering the `users` or `meetups` tables.
- Before installing any heavy state-management libraries (Zustand, Redux). Lean on React 19 hooks and local PowerSync state.

### Never Do:
- **Do not write high-frequency betting logic to Supabase directly.** All bets must be pushed to the Upstash Redis queue via Cloudflare Workers (Hono) to prevent PostgreSQL connection exhaustion.
- **Do not leak user profiles.** The `meetups` private chat must rely on strict PostgreSQL Row Level Security (RLS). Never expose `user_b_real_name` in the API payload until the database column `meetup_verified` is explicitly `true`.
- **No "AI Slop" UI.** Do not use blurred gradient backgrounds, large border radiuses (`rounded-2xl`), or excessive padding. 

## 3. Design System & UI Rules
- **Base Aesthetic:** High-density, tactile financial terminal. Dark mode only (`#000000` or `#0A0A0A` backgrounds).
- **Structure:** Separate sections with 1px hairline borders (`border-white/10`). Use compact padding (`p-3`, `p-4`) to maximize data density.
- **Borders:** Use sharp corners (`rounded-sm` or `rounded-md` max).
- **Color Palette:** Monochrome (black, white, gray) for 95% of the UI. Use exactly one vibrant accent color (e.g., Neon Cyan or Electric Yellow) exclusively for primary call-to-action buttons (Place Bet, Meetup Mode).

## 4. Development Commands
- Install dependencies: `pnpm install`
- Start local development server: `pnpm dev`
- Generate Supabase types: `pnpm run update-types`
- Lint & Typecheck: `pnpm typecheck`

## 5. Security & AI Pipeline
- **AI Moderation:** All user-submitted market ideas must pass through the Vercel AI SDK using Mistral. Enforce structured outputs using `generateObject` with a strict Zod schema matching `{ title, category, resolution_criteria, expiry_date }`.
- **Environment Variables:** Never log API keys or user session tokens. Ensure `NEXT_PUBLIC_` prefixes are only used for safe client-side keys.

