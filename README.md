# AI Interview Desk

**Claude-powered mock interview coach + profile optimizer + pipeline tracker** for AI engineering contract platforms (Mercor, Outlier, Mindrift, Alignerr).

> Now running on **OpenRouter** (cheaper + flexible models). Default: `anthropic/claude-3.5-haiku-20241022`

**Live Demo:** https://ai-interview-desk.vercel.app  
**Repo:** https://github.com/Berko207/ai-interview-desk

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Berko207/ai-interview-desk&env=OPENROUTER_API_KEY)

---

## Status

✅ Fixed `next.config.ts` build error  
✅ Switched to OpenRouter  
✅ `OPENROUTER_API_KEY` configured in Vercel  
✅ Clean API route deployed

The app should now build and run successfully.

---

## Quick Start

```bash
git clone https://github.com/Berko207/ai-interview-desk.git
cd ai-interview-desk
cp .env.example .env.local
# Add your OpenRouter key
npm install
npm run dev
```

---

## How to Change Model

Set `OPENROUTER_MODEL` env var in Vercel or `.env.local` to any OpenRouter model slug.

Default is cheap and capable. You can switch to Sonnet, GPT-4o-mini, Gemini, etc.

---

## License

    MIT

    Built for builders chasing the engineering tier.