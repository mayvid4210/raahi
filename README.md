# Raahi

A small, mobile-first React PWA for exploring a path from learning to livelihood. No backend, accounts or AI API.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://localhost:5173).

## Test the offline PWA

The service worker is enabled in production builds:

```sh
npm run build
npm run preview
```

1. Open http://localhost:4173 online and wait for the service worker to activate. Reload once.
2. Have a conversation with Raahi, review the extracted profile, make any corrections, and confirm it.
3. Refresh or close/reopen the tab. The same profile and progress should appear.
4. In browser developer tools, set Network to Offline. Reload `/dashboard`, `/profile`, `/journey`, `/opportunities` and `/projects` directly. Saved content should remain available.
5. Re-enable the network to see “Back online • Ready to sync”. This is a status message; remote sync is not implemented.
6. Check layout at 320px and 390px widths. On a phone, installation and offline caching require HTTPS hosting; localhost is allowed for desktop testing.

IndexedDB `raahi` contains `data` records for profile, onboarding, selectedCareer, learningProgress, savedOpportunities and savedProjects. The onboarding record contains the conversation history, extracted profile, selected language, current status and completion flag. Each student reply and language change saves this record; confirmation atomically saves it together with the final profile. Every successful write adds a record to `pendingChanges` in the same transaction. A future backend can drain that queue. Nothing is transmitted today. Data is tied to this browser and origin, and can be removed by clearing site data; persistent storage remains subject to browser/device eviction.

Opportunity and career content is sample guidance, not live listings or AI recommendations. The learning roadmap is a simple demo checklist, with progress stored separately for each career. Onboarding uses a local, rule-based conversation engine through `getNextConversationTurn(message, profile, history)`, ready for a future server-side AI integration. It extracts explicit details, follows contextual cues (such as shop work or drawing), and asks about missing information, ending after roughly 5–8 replies without requiring every field. No API key or network call is used. English/Hindi selection persists with the transcript. Web Speech recognition fills an editable reply using en-IN or hi-IN where supported; recognition may require an internet connection depending on the browser, while text onboarding always works offline. Read-aloud is optional through browser speech synthesis. Other feature screens remain in English. Facilitator mode opens the single student profile on this device.

## Verification completed

Production build passed. Headless Chrome checks passed for all nine routes at 320, 390, 768 and 1440px with no horizontal overflow or JavaScript exceptions. Completed all seven onboarding questions, reloaded the profile and learning progress, closed/reopened the tab, and confirmed persisted profile and pending-change records. With Chrome network emulation set to Offline, directly reloaded the landing, dashboard, profile, journey, opportunities, projects and future routes; saved opportunity/project collections remained available. Reconnection displayed the expected status. Mobile landing layout was also visually inspected.


### Conversational onboarding checks

Verified in Chrome: two replies and refresh restore the exact conversation; Hindi and transcript persist after refresh; replies continue updating the profile offline; offline review, correction and confirmation work; the confirmed profile survives closing/reopening a tab offline; returning online does not reset the conversation. Checked English/Hindi extraction, contextual followups, negation, evidence-based skills, and the eight-reply cap with local engine assertions. Chat and summary fit 320/390/768/1440px widths with no runtime exceptions. Browser speech APIs were mocked to verify language selection, editable transcripts, opt-in read-aloud and disabled-mic fallback; actual microphone recognition and audio playback require a manual check on a supported device.
