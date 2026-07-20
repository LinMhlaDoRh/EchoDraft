# EchoDraft
​
Turn one pillar piece into five platform-native drafts that still sound like you.
​
**Live app:** https://echo-draft-brown.vercel.app/
​
EchoDraft learns your writing voice from a few samples, then repurposes any long-form
content into ready-to-post drafts for **LinkedIn, X, Instagram, YouTube, and email**,
checking each one for authenticity and letting you refine individual drafts on demand.
​
## Features
​
- **Voice profile:** paste 3–5 writing samples and EchoDraft extracts your tone,
  vocabulary, sentence rhythm, and personal do’s and don’ts.
- **Five platform drafts in one step:** a single request produces a LinkedIn post,
  an X thread, an Instagram caption, a YouTube description, and an email newsletter,
  each written to that platform’s format.
- **Authenticity check:** every draft gets a local authenticity score that flags
  generic, robotic phrasing. No network calls are needed for scoring.
- **Refine one draft at a time:** open **Tweak** on any card (“make it punchier”,
  “cut 20%”, “more casual”) and only that draft is regenerated.
- **Copy or export:** copy a single draft, or export all five as a `.txt` file.
​
## Tech stack
​
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Google Gemini for voice analysis and generation
​
## Live demo
​
Try it now: https://echo-draft-brown.vercel.app/
​
Build a voice profile, then paste a pillar piece and generate.
​
## Run it locally
​
```bash
npm install
cp .env.example .env.local   # add your keys
npm run dev
```
​
Next.js will print the local address to open in your browser.
​
> Without a `GEMINI_API_KEY`, the app runs offline with built-in sample drafts, so you
> can explore the full flow before adding a key.
​
## Environment variables
​
Set these in `.env.local` (never commit real secrets):
​
| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | For live output | Server-side Gemini key. Never prefix with `NEXT_PUBLIC_`. |
| `GEMINI_MODEL` | Optional | Model name (defaults to `gemini-2.5-flash`). |
| `ECHODRAFT_API_TOKEN` | In production | Protects the API routes. Generate with `openssl rand -hex 32`. |
| `ECHODRAFT_SESSION_SECRET` | Optional | Separate cookie-signing secret (defaults to `ECHODRAFT_API_TOKEN`). |
| `ECHODRAFT_RATE_LIMIT_MAX` | Optional | Requests allowed per window (default 20). |
| `ECHODRAFT_RATE_LIMIT_WINDOW_MS` | Optional | Rate-limit window in ms (default 60000). |
​
In production, API routes are protected: browser visitors receive a signed httpOnly
session cookie automatically, and automated callers must send the API token via
`x-echodraft-token` or `Authorization: Bearer`. A spoofed `Origin` is never sufficient.
​
## Scripts
​
```bash
npm run dev         # start the dev server
npm run build       # production build
npm start           # run the production build
npm run typecheck   # TypeScript type checking
npm run lint        # lint
npm test            # run the test suite
```
​
## Project structure
​
```
app/            Pages and API routes
components/     UI components
lib/            Voice analysis, generation, authenticity, refinement, security
tests/          Test suite
docs/           Project documentation
```
​
## How it was built
​
EchoDraft was built for the IBM AI Builders Challenge. The AI pair-programming
session log is preserved in [`docs/ibm-bob-chat-history.md`](docs/ibm-bob-chat-history.md).
​
