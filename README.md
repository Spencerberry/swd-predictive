# SWD Predictive Tool

YouTube video performance prediction — powered by Scale with Data.

## Setup

```bash
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Run locally:
```bash
npm run dev
```

## Deploy to Vercel

1. Create repo on GitHub: `swd-predictive`
2. Push code
3. Connect to Vercel
4. Add `ANTHROPIC_API_KEY` environment variable in Vercel dashboard
5. Set custom domain: `predict.scalewithdata.store`

## Structure

- `/app/page.js` — Landing page (mode selection)
- `/app/pre-publish/page.js` — Pre-publish prediction form
- `/app/post-publish/page.js` — Post-publish prediction form
- `/app/api/predict/route.js` — Claude API prediction endpoint
- `/lib/prompts.js` — System prompts (the prediction brain)
- `/lib/constants.js` — Form options and categories
- `/components/` — Reusable UI components
