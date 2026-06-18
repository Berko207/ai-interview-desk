# AI Interview Desk

**Claude-powered mock interview coach + profile optimizer + pipeline tracker** for AI engineering contract platforms (Mercor, Outlier, Mindrift, Alignerr).

> Switched to **OpenRouter** for flexible & cheaper model access. One API key for many models.

**Live Demo:** https://ai-interview-desk.vercel.app  
**Repo:** https://github.com/Berko207/ai-interview-desk

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Berko207/ai-interview-desk&env=OPENROUTER_API_KEY)

---

## Why OpenRouter?

- Use one key for Claude, GPT, Gemini, Llama, etc.
- Often cheaper than direct Anthropic
- Easy to switch models
- Good free tier options available

---

## Features

### 1. Interview Brief
- Mercor & Outlier deep dives (format, scoring, pay tiers, strategy)
- Record-day setup checklist + Do/Don't list focused on depth over fluff

### 2. Mock Interview (AI-powered)
- Pick track (Coding / Full-stack / ML-AI / Generalist) + focus area
- One high-signal question generated (with offline static fallback)
- Live count-up timer
- Type your answer → "Score my answer" (uses your saved profile for context)
- Circular score ring + strengths + sharpen list + stronger rewrite
- Every scored answer logged to local history

### 3. Question Bank
- 8 curated high-signal questions across 4 categories
- Each shows *what it's testing* and *how to answer with depth*

### 4. Profile Builder
- Raw inputs → AI rewrites into high-tier headline + summary + bullets
- Framed in systems / architecture / evaluation language
- Live preview + one-click save
- Before/After examples included

### 5. Pipeline Tracker
- Quick-add chips for the big four platforms
- Full CRUD: status dropdowns (Researching → Active/Rejected), notes, delete
- Persisted locally

---

## Tech Stack & Architecture

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **lucide-react** icons
- Hand-rolled CSS design system (no Tailwind)
- **OpenRouter** (server-side only) — one key, many models
- Default model: `anthropic/claude-3.5-haiku-20241022` (cheap + capable)
- Easy to change model via `OPENROUTER_MODEL` env var
- Persistence: localStorage (`idesk_profile`, `idesk_apps`, `idesk_scores`)

**Security**: API key is read only from `process.env.OPENROUTER_API_KEY` on the server.

---

## Local Setup

```bash
git clone https://github.com/Berko207/ai-interview-desk.git
cd ai-interview-desk
cp .env.example .env.local
# Add your OpenRouter key
npm install
npm run dev
```

Test:
```bash
curl -X POST http://localhost:3000/api/interview \
  -H "Content-Type: application/json" \
  -d '{"action":"question","track":"Coding","focus":"Technical reasoning"}'
```

---

## How to Change the Model

Edit `.env.local` (or Vercel env vars):

```env
OPENROUTER_MODEL=anthropic/claude-3-7-sonnet-20250219   # better quality
# or
OPENROUTER_MODEL=openai/gpt-4o-mini                 # cheaper/faster
# or
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free   # free tier
```

Then restart dev server or redeploy.

Popular good options on OpenRouter:
- `anthropic/claude-3.5-haiku-20241022` (default - cheap & fast)
- `anthropic/claude-3-7-sonnet-20250219` (excellent quality)
- `openai/gpt-4o-mini` (very cheap)
- `google/gemini-2.0-flash-exp:free` (free tier)

---

## Deploy to Vercel

1. Import the repo
2. Add Environment Variable: `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`)
3. Deploy

---

## License

MIT

Built for builders chasing the engineering tier.