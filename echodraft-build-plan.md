# EchoDraft — Build Plan
> IBM AI Builders Challenge · July 2026 · Theme: Reimagine Creative Industries with AI  
> Deadline: **July 31, 2026, 11:59 PM ET**

---

## Overview

EchoDraft is a voice-preserving content repurposing tool. One long-form input → platform-native posts (LinkedIn, X/Twitter, Instagram, YouTube, Email) that still sound like the creator — not generic AI.

This plan breaks the build into **6 phases**, each with concrete steps and a test checkpoint to confirm it works before moving on.

---

## Phase 1 — Project Setup & Scaffold

**Goal:** A running Next.js app deployed to Vercel with a public GitHub repo.

### Steps

1. Register for the IBM AI Builders Challenge platform and start the IBM Bob 30-day free trial.
2. Complete at least one IBM SkillsBuild activity and save the certificate (required for submission).
3. Create a new **public** GitHub repository named `echodraft`.
4. Scaffold the project locally:
   ```bash
   npx create-next-app@latest echodraft --typescript --tailwind --eslint --app
   cd echodraft
   ```
5. Push the initial scaffold to GitHub:
   ```bash
   git add .
   git commit -m "chore: scaffold Next.js project"
   git push origin main
   ```
6. Connect the GitHub repo to **Vercel** (import project → auto-deploy).
7. Create a `.env.local` file for API keys (add to `.gitignore`):
   ```
   GEMINI_API_KEY=your_key_here
   ```
8. Get a free **Gemini Flash API key** from [Google AI Studio](https://aistudio.google.com/) — no credit card required.

### ✅ Phase 1 Test Checkpoint

- [ ] `npm run dev` starts the app at `http://localhost:3000` with no errors.
- [ ] The Vercel dashboard shows a live public URL (e.g. `echodraft.vercel.app`).
- [ ] The GitHub repo is public and shows the scaffold commit.
- [ ] `.env.local` is listed in `.gitignore` (API key is NOT committed).

---

## Phase 2 — Voice Profile Builder UI

**Goal:** A page where the user pastes 3–5 writing samples, submits them, and receives a saved `voiceProfile` JSON object extracted by AI.

### Steps

1. Create the page route `app/voice-profile/page.tsx`.
2. Build a form UI with:
   - A title: "Build Your Voice Profile"
   - A `<textarea>` for Sample 1, with an "Add another sample" button that appends up to 5 textarea fields.
   - A "Build My Voice Profile" submit button.
3. Create an API route `app/api/build-voice-profile/route.ts`.
4. In the API route, send the samples to the Gemini Flash API with a prompt like:
   ```
   Analyze these writing samples and extract a voice profile as JSON with these fields:
   - tone (e.g. "conversational, direct, warm")
   - vocabulary (e.g. "plain English, avoids jargon, uses analogies")
   - sentence_rhythm (e.g. "short punchy sentences, varies length")
   - dos (array of style traits to keep)
   - donts (array of things to avoid)
   
   Samples:
   {samples}
   ```
5. Return the extracted `voiceProfile` JSON to the frontend.
6. On success, save the `voiceProfile` to `localStorage` under the key `echodraft_voice_profile`.
7. Display the saved profile on screen in a readable card format (tone, vocabulary, rhythm, dos, don'ts).

### ✅ Phase 2 Test Checkpoint

- [ ] Pasting 3 writing samples and clicking "Build My Voice Profile" returns a populated JSON profile.
- [ ] The profile card renders correctly on screen with all fields visible.
- [ ] Refreshing the page still shows the saved profile (loaded from `localStorage`).
- [ ] The API route returns a `400` error gracefully if no samples are submitted.

---

## Phase 3 — Pillar Input & First Platform Generation (LinkedIn)

**Goal:** A page where the user pastes their pillar content and generates a single LinkedIn post that matches their voice profile.

### Steps

1. Create the main page at `app/page.tsx` (home route).
2. Build the UI with:
   - A `<textarea>` labeled "Paste your pillar content" (blog post, transcript, or long caption).
   - A "Generate Posts" button.
   - A results area (initially empty).
3. On submit, load the `voiceProfile` from `localStorage`.
4. Create an API route `app/api/generate/route.ts`.
5. Start with **LinkedIn only** — send this prompt to Gemini Flash:
   ```
   You are rewriting content for a creator. Use the voice profile below to match their writing style exactly.
   
   Voice Profile:
   {voiceProfile}
   
   Platform: LinkedIn
   Rules: Professional but human tone. 1200–1500 characters. Strong opening hook. 
   End with a question or call to action. Use line breaks for readability. No hashtag spam (max 3).
   
   Pillar Content:
   {pillarText}
   
   Write the LinkedIn post now:
   ```
6. Display the generated LinkedIn post in a result card with a "Copy" button.

### ✅ Phase 3 Test Checkpoint

- [ ] Pasting a blog post and clicking "Generate Posts" returns a LinkedIn post.
- [ ] The output reads differently from the raw input (it's adapted, not copy-pasted).
- [ ] The "Copy" button copies the text to the clipboard.
- [ ] If no voice profile is saved, the user sees a prompt: "Build your voice profile first."
- [ ] If the pillar input is empty, the button is disabled or shows a validation message.

---

## Phase 4 — All 5 Platforms

**Goal:** Extend the generation engine to produce all 5 platform-native outputs in one click.

### Steps

1. Update the API route `app/api/generate/route.ts` to run 5 parallel generation calls (or one batch call) for:
   - **LinkedIn** — (already done in Phase 3)
   - **X / Twitter Thread** — 3–5 tweets, each under 280 chars, strong first tweet as hook, number each tweet (1/5, 2/5…)
   - **Instagram Caption** — conversational, 150–300 words, hook in first line, relevant emojis, 5–10 hashtags at the end
   - **YouTube Description** — 200–300 words, keyword-rich first paragraph, timestamps placeholder, links section
   - **Email Newsletter Blurb** — 100–150 words, subject line suggestion, personal opener, one clear CTA
2. Each platform prompt must include the `voiceProfile` to enforce voice matching.
3. Update the results UI to show 5 cards — one per platform — each with:
   - Platform name + icon
   - Generated text
   - "Copy" button
4. Add an **"Export All"** button that downloads a `.txt` file containing all 5 outputs.

### ✅ Phase 4 Test Checkpoint

- [ ] One click produces all 5 platform outputs simultaneously.
- [ ] Each output is visibly different in length, tone, and structure from the others.
- [ ] Twitter/X output is split into numbered tweets, each ≤ 280 characters.
- [ ] Instagram output ends with hashtags.
- [ ] YouTube output has a keyword-rich first paragraph.
- [ ] "Export All" downloads a `.txt` file with all 5 outputs clearly labeled.
- [ ] All 5 "Copy" buttons work correctly.

---

## Phase 5 — Voice Match Refinement, Styling & Polish

**Goal:** The app looks good, voice matching is noticeably effective, and the UX is smooth enough to demo.

### Steps

1. **Voice match tuning** — test with a distinctive voice (e.g. very casual/Gen-Z, or very formal/academic). Adjust prompts if outputs feel generic.
2. **Navigation** — add a simple top nav with links: "Home (Generate)" and "Voice Profile."
3. **Loading states** — show a spinner or skeleton while AI is generating.
4. **Error states** — show a user-friendly message if the API call fails (e.g. rate limit hit).
5. **Mobile responsiveness** — ensure the layout works on a phone screen (Tailwind responsive classes).
6. **Nice-to-have (if time):** Add a "Regenerate with tweak" input per card — a small text field where the user types "make it shorter" and re-runs just that platform's generation.
7. **Nice-to-have (if time):** Authenticity check — after generation, run a second AI call that flags any phrases that sound "generic AI" and suggests alternatives.

### ✅ Phase 5 Test Checkpoint

- [ ] Test with two very different voice profiles — outputs should feel noticeably different from each other.
- [ ] The app works and looks good on a mobile screen (375px width).
- [ ] Loading spinner appears while generating and disappears when done.
- [ ] A simulated API failure (wrong key) shows a readable error message — not a blank screen or console error.
- [ ] Ask a friend or colleague to use the app without guidance — they can complete the full workflow without help.

---

## Phase 6 — Deploy, README, Demo Video & Submit

**Goal:** Everything is live, documented, and submitted before the deadline.

### Steps

1. **Final deploy to Vercel:**
   - Add `GEMINI_API_KEY` to Vercel environment variables (Settings → Environment Variables).
   - Push final code — Vercel auto-deploys.
   - Test the live URL end-to-end in an **incognito browser**.

2. **Write the README** (required — must cover the Creative Industries theme):
   ```markdown
   # EchoDraft
   ## Problem
   ## Solution & How It Works
   ## Challenge Theme: Reimagine Creative Industries with AI
   ## AI & Technical Approach
   ## Architecture
   ## How IBM Bob Was Used
   ## Tech Stack
   ## Install & Run Locally
   ## Live Demo
   ## Demo Video
   ```

3. **Record the demo video (≤ 3 minutes):**
   - Show the Voice Profile Builder — paste samples, show the extracted profile.
   - Show the main generate flow — paste a pillar piece, click generate, show all 5 outputs.
   - Highlight one output side-by-side with the raw input to show the voice match.
   - Upload to YouTube (unlisted is fine) or Loom.

4. **Publish the Project Page** on the challenge platform:
   - Fill in all required sections (do NOT leave as draft).
   - Add the GitHub repo link, live demo link, and demo video link.

5. **Final submission checklist:**
   - [ ] Functioning prototype (core workflow works end-to-end).
   - [ ] IBM Bob used as primary dev tool (documented in README).
   - [ ] AI is a central, user-facing function.
   - [ ] IBM SkillsBuild certificate completed and saved.
   - [ ] Public GitHub repo with full README.
   - [ ] Public demo video (≤ 3 minutes).
   - [ ] Project Page published (not draft), all sections complete.
   - [ ] All links tested in incognito/private browser.

### ✅ Phase 6 Test Checkpoint

- [ ] The live Vercel URL works end-to-end in incognito (no login, no local env vars).
- [ ] The GitHub repo is public and the README renders correctly on GitHub.
- [ ] The demo video link is public and plays without sign-in.
- [ ] The Project Page is published (not draft) and all links open correctly.
- [ ] Every item in the submission checklist above is ticked.

---

## Quick Reference — File Structure

```
echodraft/
├── app/
│   ├── page.tsx                        # Main generate page (home)
│   ├── voice-profile/
│   │   └── page.tsx                    # Voice Profile Builder page
│   └── api/
│       ├── build-voice-profile/
│       │   └── route.ts                # AI: extract voice profile from samples
│       └── generate/
│           └── route.ts                # AI: generate all 5 platform outputs
├── components/
│   ├── VoiceProfileCard.tsx            # Displays the saved voice profile
│   ├── PlatformOutputCard.tsx          # One result card (text + copy button)
│   └── Navbar.tsx                      # Top navigation
├── lib/
│   └── gemini.ts                       # Gemini API client helper
├── .env.local                          # API keys (gitignored)
└── README.md
```

---

## Risk Watch List

| Risk | What to watch for | Action |
|---|---|---|
| Bobcoin / trial runs out | Bob stops responding mid-build | Push to GitHub constantly; have a backup email ready |
| Gemini rate limits during demo | Generation fails mid-video | Pre-run and screenshot all demo examples before recording |
| Voice match feels generic | Outputs sound like each other | Use a very distinctive sample voice; tighten the voice profile prompt |
| Scope creep | Running out of time | Ship the 5-platform MVP first — authenticity check and "regenerate with tweak" are bonus only |

---

*Built with IBM Bob · Powered by Gemini Flash · Hosted on Vercel*
