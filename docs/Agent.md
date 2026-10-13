## 1. Project Overview & Core Purpose
- **Project Name:** Radar (Campus Prediction Market & Local-First Meetup Platform)
- **Core Loop:** High-throughput campus prediction markets with live anonymous poll chats, funneling paired users into a private, offline-first 24-hour physical meetup protocol.
- **Tech Stack:**
  - **App Shell & UI:** Next.js 15+ (App Router, React 19 Compiler), Serwist (`@serwist/next` for offline precaching), Tailwind CSS v4, Shadcn/ui + Cult UI (`@cult-ui`), Framer Motion / CSS Compositor animations.
  - **Local-First Layer:** PowerSync Web SDK (`@powersync/web`, `@powersync/react`) backed by WA-SQLite in OPFS/IndexedDB.
  - **Core Database & Auth:** Supabase (PostgreSQL, Auth, Row Level Security).
  - **High-Concurrency Betting Engine:** Cloudflare Workers + Hono + Cloudflare Durable Objects (SQLite-backed per-market actor) OR Upstash Redis (strictly via atomic Lua scripts).
  - **AI Moderation & Market Structuring:** Vercel AI SDK (`ai`) + Groq (`@ai-sdk/groq` using `llama-3.3-70b-versatile`) + Zod.
  - **Observability:** Sentry (`@sentry/nextjs`) + OpenTelemetry.

---

## 2. Strict Architectural Boundaries (CRITICAL FOR CODE GENERATION)

### A. Server Components (RSC) vs. Local-First Client Components
- **DO NOT query PowerSync inside React Server Components.** PowerSync relies on browser WASM SQLite (IndexedDB/OPFS).
- **Route Layouts (`page.tsx`, `layout.tsx`):** Keep top-level route shells lightweight so Serwist can precache them for offline navigation.
- **Data Views (`PredictionFeed`, `MeetupRoom`, `AnonymousChat`):** MUST be Client Components (`"use client"`) that read directly from local SQLite via PowerSync's `useQuery()` hook. Never use `fetch()` or Server Actions to read data that is already synced locally via PowerSync.
- **Offline Mutation Flow:** Offline writes (chat messages, meetup state transitions) must write directly to the local PowerSync SQLite tables and flush asynchronously to the backend via the PowerSync `uploadData` connector using **UUIDv7 idempotency keys**.

### B. High-Concurrency Betting Engine & Balance Integrity
- **NEVER use Read-Modify-Write for user balances.** Reading `balance` in JS and running `UPDATE users SET balance = newBalance` is strictly forbidden.
- **NEVER push unvalidated bets into a dumb FIFO queue.** Queuing bets before deducting balances allows users to double-spend via concurrent requests.
- **Execution Rule:**
  1. All bet requests hit the **Cloudflare Worker (Hono)** endpoint (`/api/bets/place`).
  2. **Option A (Durable Object Actor - Preferred):** Route the request to the market's single-threaded `MarketActor` Durable Object, which validates the user's escrow balance in-memory, executes the LMSR odds calculation synchronously, and broadcasts the new odds over WebSockets.
  3. **Option B (Upstash Redis + Postgres RPC):** Execute an atomic Redis Lua script (`EVAL`) to verify and decrement the cached balance and update market share pools in a single tick before enqueueing the ledger entry for batch settlement into Supabase via a PostgreSQL transactional RPC (`SELECT ... FOR UPDATE` or `UPDATE users SET balance = balance - $1 WHERE id = $2 AND balance >= $1`).

### C. Double-Blind Privacy & Offline Meetup Verification
- **PostgreSQL RLS Warning:** PostgreSQL RLS filters **rows**, NOT **columns**. Never store secret fields (`user_b_real_name`, `plaintext_meetup_pin`) on the same `meetups` row that an unverified participant can `SELECT`.
- **Schema Separation Rule:**
  - Table `meetups`: Contains `id`, `market_id`, `user_a_id`, `user_b_id`, `status`, `meetup_verified` (boolean), `expires_at`, and `pin_hash` (`SHA-256(pin + meetup_id + salt)`).
  - Table `user_private_profiles`: Contains `user_id`, `real_name`, `contact_handle`. Protected by an RLS policy that ONLY allows `SELECT` if a row exists in `meetups` uniting `auth.uid()` and `user_id` where `meetup_verified = true`.
- **Offline Split-Key / PIN Verification:**
  - Never sync plaintext 4-digit meetup PINs to local SQLite.
  - Sync only the salted hash (`pin_hash`) via PowerSync. When a student enters the 4-digit PIN offline in the canteen, compute `SHA-256(input_pin + meetup_id + salt)` client-side using the browser **WebCrypto API** (`crypto.subtle.digest`). If it matches `pin_hash`, mark the local SQLite row verified and queue the cryptographic proof for server sync.

---

## 3. Coding Conventions & Guardrails

### Always Do:
- **Strict TypeScript:** No `any` or `@ts-ignore`. Type all database payloads using generated Supabase types (`Database['public']['Tables']...`).
- **End-to-End Zod Validation:** Every Hono route, Server Action, and external webhook must validate inputs with `zod` (`z.safeParse`) before executing business logic.
- **Tabular Monospace Numbers:** Any dynamic numeric value (live odds, credit balances, countdown timers, order book quantities) MUST include `font-mono tabular-nums` to prevent horizontal layout jitter during real-time WebSocket ticks.
- **Idempotency Keys:** Every state-mutating request (`POST /bet`, PowerSync `uploadData` mutations, market creation) must require a client-generated `idempotency_key` (UUIDv7).

### Ask First Before:
- Creating or running destructive Supabase migrations (`DROP`, column type alterations) on `users`, `wallets`, `markets`, or `meetups`.
- Installing external state libraries (Redux, Zustand, Jotai). Use **PowerSync reactive SQLite queries** for persistent state and **React 19 hooks** (`useOptimistic`, `useActionState`, `use`) for ephemeral UI state.
- Adding new client-side npm packages larger than 15KB gzipped.

### Never Do:
- **No Direct Client-to-Supabase Writes for Bets or Meetups:** The browser client must never run `.from('bets').insert()` or `.from('users').update()` directly via `supabase-js`. All mutations go through Hono/Cloudflare Workers or PowerSync `uploadData`.
- **No "AI Slop" UI:**
  - Forbidden classes: `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `backdrop-blur-*`, multi-stop neon gradients (`bg-gradient-to-*`), drop shadows (`shadow-lg`, `shadow-xl`), or bloated container padding (`p-8`, `p-10`).

---

## 4. Design System & UI Rules (Tactile Financial Terminal)
- **Theme:** Strict Dark Mode only.
  - Primary Canvas: `#000000` (`bg-black`)
  - Elevated Surface / Cards: `#0A0A0A` (`bg-[#0A0A0A]`)
- **Grid & Borders:** High-density bento/terminal layout separated by `1px` solid hairline borders (`border-white/10` or `border-zinc-800`).
- **Radius & Spacing:** Sharp corners (`rounded-none`, `rounded-xs`, or `rounded-sm` max `4px`). Compact spacing (`p-2.5`, `p-3`, `p-4`, `gap-2`).
- **Color Discipline:**
  - **95% Monochrome:** Pure white (`#FFFFFF`) for primary text/tickers, zinc grays (`text-zinc-400`, `text-zinc-500`) for metadata and labels.
  - **5% High-Contrast Accent:** Use **Neon Cyan (`#00F0FF`)** or **Electric Yellow (`#FACC15`)** strictly for primary active states (Place Bet CTA, active Meetup Mode pulse, positive odds delta).
- **Component Primitives:** Use Shadcn/ui + Cult UI (`@cult-ui`), stripped of soft shadows and restyled to match the `1px` hairline terminal aesthetic.

---

## 5. AI Moderation & Market Structuring Pipeline
- **Provider & Model:** Vercel AI SDK (`generateObject`) + Groq (`@ai-sdk/groq` with `llama-3.3-70b-versatile`).
- **Prompt Injection & Temporal Guardrails:**
  - Always inject the current server ISO timestamp (`new Date().toISOString()`) and local campus timezone (`Asia/Kolkata`) into the system prompt so relative times (*"tonight at 8 PM"*) resolve accurately.
  - Never allow the LLM output to write directly to the `markets` table unattended. Return the structured output (`{ title, category, resolution_criteria, expiry_date, is_safe, rejection_reason }`) as a draft preview or enforce a strict server-side validation check where `expiry_date > now()` and `is_safe === true`.
- **Local Development Fallback:** If `process.env.GROQ_API_KEY` is undefined in `development`, automatically fall back to a deterministic mock generator so offline local development never breaks.

---

## 6. Development Commands
- **Install dependencies:** `pnpm install`
- **Start local dev server:** `pnpm dev`
- **Add Cult UI primitive:** `pnpm dlx shadcn@latest add @cult-ui/<component-name>`
- **Sync Supabase TypeScript types:** `pnpm run update-types`
- **Typecheck & Lint (Run before every commit):** `pnpm typecheck && pnpm lint`
