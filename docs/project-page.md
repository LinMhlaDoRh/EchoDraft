# EchoDraft — Project Page

> **Project status: Complete.** Built, tested, secured, deployed, and documented. All sections below are marked complete.

Turn one pillar piece into five platform-native drafts that still sound like you.

**Live app:** https://echo-draft-brown.vercel.app/  
**Built for:** IBM AI Builders Challenge  
**Repository:** https://github.com/LinMhlaDoRh/EchoDraft

---

## Project status

Every section of this project is complete.

- [x] Concept and problem definition
- [x] Voice profile engine
- [x] Multi-platform generation (5 platforms)
- [x] Authenticity scoring
- [x] Per-draft refinement (Tweak)
- [x] Security, session auth, and rate limiting
- [x] Testing (automated suite + manual guide)
- [x] Deployment to Vercel
- [x] Documentation and README
- [x] Demo assets and sample scenarios

---

## The problem

Most creators repurpose content the wrong way. They write one strong post, then copy and paste the exact same text onto LinkedIn, X, Instagram, YouTube, and their newsletter, and wonder why it lands on only one platform. Each platform has its own rhythm, and generic AI rewrites strip out the voice that made the original worth reading.

**Status: Complete** ✅

## The solution

EchoDraft learns your writing voice from a few samples, then repurposes any long-form piece into ready-to-post drafts for five platforms. It keeps the idea the same but reshapes the hook, pacing, and structure for each place, so you sound like yourself five different ways. Every draft is scored for authenticity, and any single draft can be refined on demand.

**Status: Complete** ✅

## Key features

- **Voice profile:** paste 3 to 5 writing samples and EchoDraft extracts your tone, vocabulary, sentence rhythm, and personal do's and don'ts.
- **Five drafts in one step:** one request produces a LinkedIn post, an X thread, an Instagram caption, a YouTube description, and an email newsletter, each in that platform's native format.
- **Authenticity check:** every draft gets a local authenticity score that flags generic, robotic phrasing, with no network call needed for scoring.
- **Refine one draft at a time:** open Tweak on any card ("make it punchier", "cut 20%", "more casual") and only that draft is regenerated.
- **Copy or export:** copy a single draft, or export all five as a `.txt` file.

**Status: Complete** ✅

## How it works

1. **Capture voice:** the user submits writing samples. A Gemini call analyzes them into a structured voice profile, stored in the browser.
2. **Generate:** the user pastes a pillar piece. A single batched request produces all five platform drafts, each guided by the voice profile and platform-specific formatting rules.
3. **Score:** each draft is checked locally against authenticity heuristics and given a score and suggestions.
4. **Refine:** the user can tweak any single draft, which regenerates just that one output.

**Status: Complete** ✅

## Tech stack

- Next.js (App Router), React, and TypeScript
- Tailwind CSS
- Google Gemini for voice analysis and generation
- Deployed on Vercel

**Status: Complete** ✅

## Security

- Server-side API key only, never exposed to the browser and never in a query string.
- Production API routes are protected: browser visitors receive a signed httpOnly session cookie automatically, and automated callers must send an API token.
- Content Security Policy with per-request nonce, plus input size caps and a rate limiter as defense in depth.

**Status: Complete** ✅

## Testing

- Automated suite covering voice profiles, single-platform generation, multi-platform generation, and authenticity and refinement, all passing with no external API calls.
- TypeScript typecheck passes clean.
- A manual test guide walks through the full flow (profile, generation, authenticity, tweak, copy, export, mobile) against the live app.

**Status: Complete** ✅

## Deployment

Deployed on Vercel at https://echo-draft-brown.vercel.app/. Environment variables (Gemini key, API token, optional model and rate-limit settings) are configured in the Vercel project. Secrets are never committed.

**Status: Complete** ✅

## Links and resources

- **Live app:** https://echo-draft-brown.vercel.app/
- **Repository:** https://github.com/LinMhlaDoRh/EchoDraft
- **README, manual test guide, and build history:** included in the project package (`docs/`)

**Status: Complete** ✅

---

> All sections complete. EchoDraft is live, tested, and ready to demo.
