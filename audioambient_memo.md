# Internal Memo — AudioAmbient Platform

**To:** Engineering & Product  
**Date:** April 14, 2026  
**Subject:** System Architecture Review & Strategic Expansion Roadmap  
**Classification:** Internal

---

## Executive Summary

AudioAmbient has been successfully evolved from a static ambient sound player into a **full-stack, AI-powered soundscape platform**. This memo documents the current architecture, the reasoning behind key technical decisions, and a structured roadmap for future expansion. The platform is production-ready and deployed on a globally distributed edge network.

---

## 1. Current System Architecture

### 1.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Home Page  │  │  Library View│  │  Mixer Deck    │ │
│  │  (Landing)  │  │  (Supabase)  │  │  (Audio Engine)│ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│                           │                │            │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Audio Copilot (Gemini AI)             │ │
│  │  Quick Prompts → useChat → Stream → Sliders Move  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────┐
│              NEXT.JS APP ROUTER (Vercel Edge)            │
│  ┌──────────────────┐    ┌─────────────────────────────┐│
│  │ /api/soundscapes │    │       /api/chat             ││
│  │ GET  — fetch DB  │    │  POST — stream Gemini 1.5  ││
│  │ POST — Zod valid │    │  toolChoice: required       ││
│  │      + RLS insert│    │  Rate: 20 req/min/IP       ││
│  └──────────────────┘    └─────────────────────────────┘│
└──────┬──────────────────────────────┬────────────────────┘
       │                              │
┌──────▼──────┐              ┌────────▼────────────────────┐
│  Supabase   │              │      Google AI API          │
│  PostgreSQL │              │    Gemini 1.5 Flash         │
│  + RLS      │              │    Tool Calling (JSON)      │
└─────────────┘              └─────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.2.3 | SSR, API routes, edge deployment |
| Styling | Tailwind CSS | 3.x | Utility-first design system |
| Database | Supabase (PostgreSQL) | — | Cloud-hosted relational DB with RLS |
| DB Client | `@supabase/supabase-js` | 2.x | Typed DB access, two-tier client |
| AI Runtime | Vercel AI SDK | `ai@6.x` | Streaming, tool calling, react hooks |
| AI Model | Google Gemini 1.5 Flash | — | LLM for soundscape generation |
| AI Provider | `@ai-sdk/google` | 3.x | Gemini API adapter |
| AI React Hook | `@ai-sdk/react` | 3.x | `useChat`, streaming to UI |
| Validation | Zod | 3.x | Runtime schema enforcement |
| Deployment | Vercel | — | CDN + serverless functions |
| Audio Engine | Web Audio API | Native | Browser-native sound mixing |
| Audio Assets | MP3 @ 128kbps | 38 files | Optimized from original WAV sources |

### 1.3 Data Model

```sql
-- soundscapes table (Supabase PostgreSQL)
CREATE TABLE soundscapes (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255)              NOT NULL,
  tag          VARCHAR(100)              DEFAULT 'Custom',
  image        TEXT                      NOT NULL,
  volumes      JSONB                     NOT NULL,  -- { "rain": 80, "brown": 40 }
  active_sounds JSONB                    NOT NULL,  -- ["rain", "brown"]
  created_at   TIMESTAMPTZ               DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE soundscapes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can read"  ON soundscapes FOR SELECT USING (true);
CREATE POLICY "public can write" ON soundscapes FOR INSERT WITH CHECK (true);
```

### 1.4 AI Tool Calling Flow

```
User types / taps chip
        ↓
useChat.append({ role: 'user', content })
        ↓
POST /api/chat  [rate limited: 20/min/IP]
        ↓
streamText({ model: gemini-1.5-flash, toolChoice: 'required' })
        ↓
Gemini analyzes mood → calls setMixerLevels({ volumes: {...} })
        ↓
onToolCall fires on client → applyMixerLevels(volumes)
        ↓
React state update → Audio Web APIs receive new gain values
        ↓
Sliders animate. Music changes. User hears new soundscape.
```

### 1.5 Security Posture

| Domain | Measure | Status |
|--------|---------|--------|
| Secrets | `.env.local`, never committed | ✅ |
| DB Access | Dual client (anon vs service role) | ✅ |
| DB Policy | Row Level Security with SELECT/INSERT policies | ✅ |
| API Input | Zod schema validation on all POST routes | ✅ |
| AI Cost | Per-IP rate limiting + `maxTokens: 500` cap | ✅ |
| Error Leaks | Generic error messages to clients, detailed server logs | ✅ |
| HTTP Headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` | ✅ |
| Dependencies | `npm audit` → 0 vulnerabilities | ✅ |
| Credentials | `db_setup.js` gitignored, no secrets in any committed file | ✅ |

---

## 2. Future Expansion Roadmap

### Phase 1 — Authentication & User Ownership *(Recommended Next)*
**Timeline: 2–3 weeks**

The current model lets anyone write to the database. Adding user identity enables personal libraries and data privacy.

- Integrate **Supabase Auth** (Email + Google OAuth)
- Add `user_id` column to `soundscapes` table
- Update RLS policies: users can only `DELETE` their own rows
- Add a **"My Library"** tab showing only the current user's saved mixes
- Add **profile page** with saved sound statistics

### Phase 2 — AI Agent Enhancement
**Timeline: 1–2 weeks**

The AI Copilot currently does one-shot soundscape generation. Expanding to a multi-turn memory agent unlocks dramatically richer experiences.

- **Session memory**: Feed the last user state (currently active sounds + volumes) into the system prompt on each request so the AI can iterate (*"make it more intense"*, *"add thunder"*)
- **Emotion tracking**: Track what mixes a user plays most and surface personalized recommendations
- **AI-generated mix names + images**: On save, use Gemini to auto-generate a title and DALL-E to generate a unique cover image for the soundscape
- **Mood journaling**: Let users log how they felt before/after a soundscape session; feed this back to the AI for personalization

### Phase 3 — Content Expansion
**Timeline: 3–4 weeks**

- **Sound Pack DLC**: Introduce paid sound packs (binaural frequencies, premium nature recordings)
- **User-uploaded sounds**: Allow users to upload their own short ambient loops (stored in Supabase Storage)
- **Scheduled Soundscapes**: *"Play Forest Walk every day at 7am for my morning routine"* via Vercel Cron Jobs
- **Soundscape sharing**: Shareable URLs (e.g., `audioambient.app/s/abc123`) that load a specific community mix

### Phase 4 — Monetization & Subscriptions
**Timeline: 4–6 weeks**

- **Stripe integration**: Pro tier ($9/month) unlocking premium sound packs, unlimited saves, and AI Copilot
- **Usage gating**: Free users limited to 5 saved soundscapes and 10 AI requests/day
- **Lifetime license**: One-time payment model as shown in the existing pricing UI
- **Team workspaces**: Shared soundscape libraries for remote teams or coworking spaces

### Phase 5 — Native App & Offline
**Timeline: 6–8 weeks**

- **Progressive Web App (PWA)**: Add `manifest.json` + service worker for installable, offline-capable mixed playback from cache
- **React Native / Expo**: Share business logic across web and mobile; native iOS/Android apps
- **Background audio**: True background playback even when the screen is off (system audio session)

---

## 3. Known Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| In-memory rate limiting | Medium | Resets on serverless cold start; replace with Upstash Redis for persistent rate tracking |
| No pagination on Library | Low | Will degrade as soundscape count grows; implement cursor-based pagination |
| Anonymous inserts | High | No spam protection yet beyond Zod validation; blocked by Phase 1 (Auth) |
| SSL bypass in db_setup.js | Low | Local script only, not in production code; acceptable until replaced by Supabase dashboard management |
| No error boundaries | Medium | A component crash surfaces as a blank page; add React `<ErrorBoundary>` wrappers |

---

## 4. Infrastructure Costs (Estimated)

| Service | Free Tier | Projected Cost at Scale |
|---------|-----------|------------------------|
| Vercel | 100GB bandwidth/month | ~$20/month (Pro) |
| Supabase | 500MB DB, 2GB bandwidth | ~$25/month (Pro) |
| Google Gemini | 1M tokens/day free | ~$0.075 per 1M tokens |
| Total at launch | **$0** | **~$45–60/month** |

---

*AudioAmbient — Built with Next.js, Supabase, and Google Gemini. Deployed globally on Vercel.*
