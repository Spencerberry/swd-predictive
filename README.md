# SWD Predictive Tool v2

YouTube video performance prediction with user accounts and prediction history.

## Setup

```bash
npm install
```

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run locally:
```bash
npm run dev
```

## Supabase Setup

1. Create project at supabase.com
2. Run `supabase-schema.sql` in SQL Editor
3. Add URL and anon key to environment variables

## Structure

- `/app/page.js` — Landing page
- `/app/auth/page.js` — Sign in / Sign up
- `/app/pre-publish/page.js` — Pre-publish prediction
- `/app/post-publish/page.js` — Post-publish prediction
- `/app/history/page.js` — Prediction history + accuracy tracking
- `/app/api/predict/route.js` — Claude API prediction endpoint
- `/lib/prompts.js` — System prompts
- `/lib/supabase.js` — Supabase client
- `/lib/db.js` — Database helpers
- `/components/AuthProvider.js` — Auth context
- `/components/ChannelBaseline.js` — Channel profile save/load
- `/components/ProtectedRoute.js` — Auth guard
