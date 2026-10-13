# Radar Architecture Refactoring & Verification Report

**Date:** 2026-10-14  
**Project:** Radar (Campus Prediction Market & Local-First Meetup Platform)  
**Status:** Completed & Verified  

---

## 1. Executive Summary

Following updates to [docs/Agent.md](file:///home/ubu/Documents/dev/web/radar/docs/Agent.md) and the engineering directives in [docs/principle.md](file:///home/ubu/Documents/dev/web/radar/docs/principle.md), the entire codebase was audited and refactored across the following architectural pillars:

1. **Security & Double-Blind Privacy:** Eliminated plaintext identity leaks in PostgreSQL by decoupling `meetups` from `user_private_profiles` with a strict conditional RLS policy. Implemented offline WebCrypto 4-digit PIN verification against salted `pin_hash`.
2. **High-Concurrency Betting Engine:** Replaced the unvalidated FIFO queue with an atomic Upstash Redis Lua script (`EVAL`) that checks escrow balance, decrements balance, increments market pools, and records UUIDv7 idempotency in a single execution tick.
3. **Local-First Data Layer:** Implemented the PowerSync schema (`markets`, `market_messages`, `meetups`, `meetup_messages`), asynchronous `uploadData` CRUD connector, and reactive `usePowerSyncQuery` hook.
4. **Temporal AI Moderation:** Configured Groq (`llama-3.3-70b-versatile`) with server timestamp injection and `Asia/Kolkata` campus timezone guardrails.
5. **Tactile Terminal UI:** Refactored views into dedicated client components (`PredictionFeed`, `MeetupRoom`, `AnonymousChat`), stripped deprecated components, and enforced `font-mono tabular-nums` across all dynamic numeric figures.

---

## 2. Architectural Compliance Matrix

| Architecture Boundary (`Agent.md`) | Prior State | Refactored State | Compliance |
| :--- | :--- | :--- | :---: |
| **Server Components vs. Client Data Views** | Monolithic RSC `page.tsx` rendering hardcoded data with local `useState` in subcomponents. | `page.tsx` is a lightweight RSC shell; `PredictionFeed`, `MeetupRoom`, and `AnonymousChat` are client components querying local SQLite. | **PASS** |
| **Balance Integrity & Concurrency** | Dumb `lpush` into Redis FIFO queue allowing double-spending race conditions. | Atomic Redis Lua script verifies escrow balance &ge; bet amount, debits balance, and enqueues in 1 tick. | **PASS** |
| **Idempotency Keys** | No client-generated idempotency tracking. | RFC 9562 UUIDv7 generator (`generateUuidV7`) enforced on all bet orders and sync operations. | **PASS** |
| **Double-Blind Meetup Privacy** | `user_b_real_name` stored directly on the `meetups` table, accessible via unverified SELECTs. | Zero secret columns on `meetups`. `user_private_profiles` protected by conditional RLS requiring verified handshake. | **PASS** |
| **Offline PIN Verification** | Relied on a Next.js Server Action over network. | Computed offline in-browser using WebCrypto API (`crypto.subtle.digest("SHA-256")`) against `pin_hash`. | **PASS** |
| **AI Moderation Temporal Guardrail** | Hardcoded generic prompt with no timezone or server time awareness. | Injects server ISO timestamp + `Asia/Kolkata` timezone; enforces `expiry_date > now()` and `is_safe`. | **PASS** |
| **Design System & Micro-Interactions** | Standard Tailwind classes with potential horizontal number jitter. | Dark-mode terminal palette (`#000000`/`#0A0A0A`), 1px borders, and `font-mono tabular-nums` on dynamic values. | **PASS** |

---

## 3. Modular File Structure & Component Map

```
/home/ubu/Documents/dev/web/radar/
├── docs/
│   ├── Agent.md                                      # Architectural specification
│   ├── principle.md                                  # Clean code & modularity rules
│   └── output-report.md                              # This audit & verification report
├── supabase/
│   └── migrations/
│       └── 20261013000000_init_radar_schema.sql      # Schema with double-blind RLS & atomic functions
├── workers/
│   └── betting-engine/
│       └── src/index.ts                              # Cloudflare Worker (Hono) /api/bets/place with Lua
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── market-actions.ts                     # Atomic bet queue submission & market creation
│   │   │   └── meetup-actions.ts                     # PIN verification & private profile revelation
│   │   ├── api/moderate/route.ts                     # AI moderation API endpoint
│   │   ├── globals.css                               # Terminal base theme variables
│   │   ├── layout.tsx                                # Root shell
│   │   └── page.tsx                                  # Lightweight RSC home shell
│   ├── components/
│   │   ├── chat/
│   │   │   └── anonymous-chat.tsx                    # Local SQLite chat view with UUIDv7
│   │   ├── market/
│   │   │   ├── betting-panel.tsx                     # Order entry with tabular-nums & UUIDv7
│   │   │   ├── market-card.tsx                       # High-density card with tabular-nums
│   │   │   └── prediction-feed.tsx                   # Reactive PowerSync query feed
│   │   ├── meetup/
│   │   │   └── meetup-room.tsx                       # Offline WebCrypto PIN verification & protocol
│   │   ├── terminal/
│   │   │   └── terminal-header.tsx                   # Monospace tabular terminal status bar
│   │   └── ui/                                       # Shadcn & Cult UI primitives (badge, button, card)
│   ├── lib/
│   │   ├── ai/moderation.ts                          # Groq temporal moderation pipeline
│   │   ├── betting/queue.ts                          # Atomic Upstash Redis Lua script
│   │   ├── crypto/meetup-pin.ts                      # WebCrypto SHA-256 PIN hash verification
│   │   ├── powersync/
│   │   │   ├── client.ts                             # Client singleton & connection management
│   │   │   ├── connector.ts                          # PowerSync uploadData CRUD connector
│   │   │   ├── hooks.ts                              # Reactive usePowerSyncQuery hook
│   │   │   └── schema.ts                             # Local SQLite schema (no secret fields)
│   │   └── utils/
│   │       ├── cn.ts                                 # Class merge utility
│   │       ├── format.ts                             # Numeric & odds formatting
│   │       └── uuidv7.ts                             # Zero-dependency RFC 9562 UUIDv7 generator
│   └── types/
│       ├── database.ts                               # Supabase schema definitions
│       ├── market.ts                                 # Zod validation models with idempotency
│       ├── meetup.ts                                 # Meetup & private profile types
│       └── moderation.ts                             # Structured AI output schema
```

---

## 4. Atomic Git Commit History

The refactoring was committed sequentially with conventional commits in adherence to `docs/principle.md`:

```
b9c69e5 feat(ui): configure shadcn and cult ui registry for terminal design system
59c45f0 feat(schema): update database types and migration for double-blind privacy and idempotency
b1f429a feat(powersync): implement local-first schema, connector, reactive hooks, and webcrypto pin verification
6829eda feat(engine): add atomic redis lua betting engine and temporal ai moderation pipeline
50ca502 refactor(ui): modularize local-first data views with tabular-nums and offline protocol
```

---

## 5. Verification & Test Evidence

### TypeScript Strict Compilation (`tsc --noEmit`)
```bash
$ pnpm exec tsc --noEmit --incremental false
# Exit code: 0 (Zero type errors)
```

### Git Repository Status
```bash
$ git status
On branch main
nothing to commit, working tree clean
```
