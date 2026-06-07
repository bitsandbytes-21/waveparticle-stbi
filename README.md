# Which Wave Particle Companion Are You?

A standalone, meme-forward MBTI quiz that matches your **work style** to one of the
8 [Wave Particle](https://waveparticle.onrender.com) AI companions — then funnels
quiz-takers into trying the app.

> **This is a separate project.** It does not import from, modify, or depend on the
> `Waveparticle-python` repo. The only link to the main product is the outbound
> `APP_URL` constant. Companion avatars were copied (not linked) into `public/companions/`.

## What it does

- **12-question quiz** framed around how you finish tasks under a deadline → a pure
  **MBTI** 4-letter type (E/I, S/N, T/F, J/P).
- The 16 types map onto the **8 companions** (2 types each) — see `data/mapping.ts`.
- **Shareable result pages** at `/result/<TYPE>` with a dynamic OG share image.
- **"Hot Takes" polls** (incl. alternate-ending questions like *"should Villanelle
  live on?"*) with live aggregate result bars — doubles as story-roadmap research.
- **Anonymous aggregate analytics** (no emails, no PII) for "what most users prefer".

## Tech

Next.js (App Router) + TypeScript · Framer Motion · `next/og` share images ·
Upstash Redis counters · Vercel Analytics.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # scoring + 16→8 mapping unit tests (vitest)
npm run build    # production build (pre-renders all 16 result pages)
```

No env vars are required for local dev — counters fall back to an in-memory store.

## Environment variables

Copy `.env.example` → `.env.local` and fill in for production:

| Var | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Anonymous aggregate counters (free Upstash Redis). Without them, counters are in-memory and reset between invocations. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site, for share links / absolute OG URLs. |
| `STATS_TOKEN` | Optional. If set, `/api/stats` requires `?token=` or an `x-stats-token` header. |

## Editing content (no code changes needed)

- **`data/questions.ts`** — the 12 questions, options, weights, and meme copy.
- **`data/mapping.ts`** — companion personas + the `MBTI_TO_COMPANION` 16→8 table + per-type flavor.
- **`data/polls.ts`** — the Hot Takes polls (one per companion + universal ones).

Scoring lives in `lib/scoring.ts` and is fully unit-tested — editing content above
never requires touching it.

## API

- `POST /api/result` `{ type, companion }` → increments anonymous counters.
- `POST /api/vote` `{ pollId, optionId }` · `GET /api/vote?pollId=` → poll tallies.
- `GET /api/stats` → full distribution (the "what most users prefer" dashboard data).

## Deploy

Push to a Git repo and import into [Vercel](https://vercel.com). Add the env vars
above. That's it — the OG images and serverless counter endpoints run on Vercel
with no extra config.

## A note on IP

This is a fan-made, non-commercial-feeling parody quiz that references pop-culture
characters by name. A public, viral site carries more trademark exposure than
in-app use — consider original/stylized art or initials if you want to be
conservative. Avatars are easy to swap in `public/companions/` + `data/mapping.ts`.
