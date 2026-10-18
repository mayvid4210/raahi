# Raahi

A mobile-first React/Vite PWA with conversational student onboarding, IndexedDB persistence, optional browser voice input/read-aloud, and a local conversation engine that works offline. The five student areas—For You, Explore, Learn, Earn and Community—use curated local demo content and deterministic personalization.

## Run locally

Requires Node.js 22.12+.

```sh
npm install
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local, then:
npm run dev
```

Open the Local URL printed by Vite (normally http://localhost:5173). The Vite development server runs the same `api/onboarding.js` handler used by Vercel. Restart the dev server after changing the key. No additional server or Gemini SDK is needed. Without a key, onboarding automatically uses the local fallback.

**Only use `GEMINI_API_KEY`, never a `VITE_`-prefixed key.** Actual `.env` files and Vercel's local state are gitignored. Do not paste keys into source files, chat messages, or browser code.

## Free-only requirement

Use a Google AI Studio key from a **Free Tier project with no linked billing account**. Do not enable Cloud Billing, add payment methods, buy credits, or start paid trials. Gemini keys inherit their project's billing tier; the application cannot verify that tier from an API key alone. Leave `GEMINI_API_KEY` empty if you cannot verify the project is on the Free Tier: all onboarding then uses the existing local engine without external AI calls.

The only configured model is `gemini-3.5-flash-lite`, listed with free-tier text input/output in [Google's pricing](https://ai.google.dev/gemini-api/docs/pricing). There are no paid tools, grounding, caching services, model switching or provider retries. Quota/rate-limit errors (including HTTP 429), unavailable models and timeouts automatically use the local Raahi engine. Do not resolve quota errors by enabling billing. See [Google's tier documentation](https://ai.google.dev/gemini-api/docs/billing).

Use **Vercel Hobby**, not Pro or a Pro trial, and the included `vercel.app` address. No paid domain, paid add-ons or Pro-only feature is needed. Hobby usage limits may pause hosting; they do not cause the app to upgrade plans. An already cached PWA can still run offline. See [Hobby plan limits and personal/non-commercial use conditions](https://vercel.com/docs/plans/hobby). Local development, browser APIs, IndexedDB, the existing open-source dependencies, and local/mocked tests need no paid service.

## Deploy on Vercel

Import this repository as a Vite project. Use `npm run build` and output directory `dist`. Add `GEMINI_API_KEY` to the project's server-side environment variables for the desired deployment environments, then deploy/redeploy. `api/onboarding.js` runs as a Node serverless function at `/api/onboarding`. `vercel.json` supports SPA deep links while excluding `/api/` from the HTML fallback.

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). The server currently uses `gemini-3.5-flash-lite` and JSON-schema structured output; your key needs access to that model and available quota. See [Gemini models](https://ai.google.dev/gemini-api/docs/models), [structured output REST documentation](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en), and [Vercel Vite functions](https://vercel.com/docs/frameworks/frontend/vite).

No account system or remote database is added. Online onboarding transmits only the latest reply, current onboarding profile and up to 16 recent conversation messages to the same-origin function, which sends that context to Gemini. Other application data and the API key are not included in browser requests. The handler does not log conversation content or provider errors.

## How conversation fallback works

`getNextConversationTurn` in `src/onboardingEngine.js` checks connectivity on every reply. Online, it tries `/api/onboarding`; server-side Gemini requests time out after 10 seconds, and the browser request times out after 12 seconds. The function validates the structured response and returns the next message and updated profile. A small `topic` field tells the existing local engine what the AI's question was about if the next answer arrives offline.

If offline, or if the request fails, times out, returns an error, or contains invalid data, the existing rule-based engine handles that same reply. A weak-connection notice appears for failed online requests. Reconnection automatically tries Gemini again on the next reply with all current profile data and the recent transcript. Existing list entries are preserved across AI turns; students can remove or replace them in the confirmation editor.

The student's message is saved **before** waiting for the network. Refreshing while Raahi is thinking restores that pending reply and resumes it without adding a duplicate message. Each finished turn saves the profile, transcript, language and state. Completion opens the existing confirmation screen, and only student confirmation sets `onboardingComplete` and writes the final profile.

## Test the offline PWA

```sh
npm run build
npm run preview
```

Open http://localhost:4173 online once and wait for the service worker to activate, then reload. Use DevTools Network → Offline to test cached routes and onboarding. `vite preview` serves the static build only; it does **not** run the serverless API, so online requests there use the fallback. Use `npm run dev` with your key or a Vercel deployment for real Gemini calls. On a phone, installation/offline caching requires HTTPS hosting; desktop localhost is allowed.

IndexedDB `raahi` stores the profile, onboarding transcript/state, selected career, progress and saved demo items in `data`. Writes also add `pendingChanges` for possible future synchronization; no synchronization exists today. Data belongs to this browser/origin and can be removed by clearing site data or device storage eviction.

Use **Reset Demo** at the bottom of the dashboard, or `/onboarding?reset=true`, to clear student data and start over, including offline. Ordinary `/onboarding` preserves progress.

English/Hindi selection persists with the transcript. Browser speech recognition may itself require internet; text onboarding remains usable offline. Read-aloud is opt-in, with available device voices. Actual microphone recognition/audio needs manual testing on the target device.

## Verification for AI onboarding

Production build and browser checks passed for cached offline onboarding, connection loss/reconnect, Hindi, halfway refresh, and resuming a pending reply exactly once. Online-response handling and confirmation were tested with mocked Gemini responses; server tests covered structured-output validation, preservation of existing list entries, provider errors, and malformed results. Client tests covered failed requests, invalid JSON/schema, cancellation and the actual 12-second timeout. A production build with a harmless server-key canary contained neither the canary nor the server handler/key header. No real key was configured during implementation, so a live Gemini conversation and Vercel deployment verification remain manual setup checks.


## Connected student experience

After profile confirmation, `/dashboard` opens **For You**. The bottom navigation links to `/explore`, `/learn`, `/earn` and `/community`; the avatar opens `/settings` with the existing profile editor and Reset Demo. Earlier `/future`, `/journey`, `/opportunities` and `/projects` links redirect into these areas. Vercel rewrites list page routes explicitly, leaving API and asset requests alone.

`src/data/demoData.js` is the shared local catalogue: six careers, illustrative branching routes, seven small-business paths, six exams, nine demo roles, five village projects, stories/podcasts, mentors, posts and offline learning activities. No added feature calls Gemini or another service. All organisations, roles, exam guidance, projects, mentors and stories are curated or fictional demos. Dates are not live, eligibility is not decided, and no salaries, admissions, placements or business returns are promised. Media players are labelled placeholders with readable notes; mentor requests are local demo states and are never sent.

Personalization matches English/Hindi profile keywords against topic tags, then scores shared content. Explicit interests receive extra weight; a selected feed topic gets additional weight. Teaching-related profiles see teaching routes, tutoring, education projects and stories together. Add interest/Interested updates local preferences and recommendations. No machine learning is involved.

The `studentExperience` record in the existing IndexedDB `data` store holds added interests, saved/interested/liked item IDs, demo mentor-request IDs and project-linked skills. The existing `selectedCareer`, `learningProgress`, `savedProjects` and `savedOpportunities` records are reused. Related updates commit atomically with `pendingChanges`; the database version/schema is unchanged. Existing confirmed profiles and earlier saved data remain intact. Completed activities use stable skill IDs so relevant completions survive a career change. Interest changes can add useful activities, and Start learning on a village project adds its skills to the chosen path. Resources are short, locally bundled practice activities, not paid courses. Reset Demo clears these records too.

All five areas are included in the PWA app-shell cache. Visit the production build once online to install its service worker; cached pages and saved interactions then work offline. No new account, card, paid plan, API key, dependency or setup is required for the student features. The existing free-tier Gemini setup is only used for onboarding.

Verification: completed teaching-oriented onboarding using the unchanged local engine, confirmed the profile, checked teaching-first recommendations and adding Business, tapped route nodes and compared careers, selected/changed paths, completed a skill and refreshed, saved a village project and added its learning activity, saved/liked community content, and saved a demo guidance request. Checked exam detail notices, all student screens at 320/390/768/1440px, and direct offline reloads of the five areas plus settings. Confirmed the original profile was unchanged and no API requests were added by student features. Existing Gemini/fallback tests are run with mocks to avoid consuming free quota.
