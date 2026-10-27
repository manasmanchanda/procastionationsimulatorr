# Procrastination Simulator

A dark, neon-themed web app that humorously tracks how creatively you avoid doing your actual work. Instead of a boring productivity tracker, it records your distractions, roasts your behavior, and scores your discipline — all stored locally in your browser.

## Features

### Task Manager
- Add tasks with deadlines and priority levels (low / medium / high).
- Check tasks off, delete them, and spot overdue ones at a glance.

### Distraction Tracker
- Log distractions across 8 categories: social, videos, gaming, doomscrolling, shopping, snack raids, daydreaming, and other.
- Each entry records a name, category, and minutes wasted.

### Productivity Score
- A 0–100 score calculated from completed task weight (priority-weighted), distraction minutes, open backlog, and streak.
- Animated counting ring that shifts color and label by tier — from "Absolutely Cooked" to "Suspiciously Productive."

### Roast Generator
- A contextual banner that serves funny, behavior-driven one-liners.
- Roast tone adapts to your score band: savage, backhanded, or (rarely) genuine praise.
- Example: *"Bro opened 17 tabs and completed 0 tasks. Inspiring."*

### Dashboard
- 7-day wasted-time bar chart (today highlighted in neon).
- Task-completion donut with done/open counts.
- Focus streak card with current and best streak.
- "Distraction diet" breakdown by category.

### Streak System
- A **clean day** = at least one task completed **and** zero distractions logged.
- Streak counts consecutive clean days ending today (or yesterday if today isn't clean yet).
- Best streak is tracked historically.

### Honest Mode (the "wait, that's actually cool" feature)
- A floating button opens a live timer you start the **moment** you cave to a distraction.
- Pick the category, hit start, and let it run while you scroll.
- When you stop, it auto-logs itself — no editing the past.
- **PANIC button**: instantly swaps the screen to a fake "Project Workspace" dashboard with a fake activity log and ticking "productive session" timer, in case someone walks by.
- Press **Esc** when the coast is clear — your real distraction timer is still running underneath.

## Design
- Dark theme with neon accents (lime, cyan, magenta, amber).
- Custom fonts: Space Grotesk (display) + JetBrains Mono (numeric).
- Animated score ring, fade/slide/pop micro-interactions, drifting ambient glow blobs.
- Fully responsive for mobile and desktop.

## Data & Privacy
- All data is stored in your browser's `localStorage` — no accounts, no servers, no cloud.
- Use the **Reset** button in the header to wipe everything (irreversible).
- Your procrastination record never leaves your device.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- lucide-react icons

## Getting Started
```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run typecheck
```

## Project Structure
```
src/
├── App.tsx                  # Main app shell, nav, header, toasts
├── types.ts                 # Shared types + category/priority metadata
├── hooks/
│   ├── useAppState.ts       # State reducer + localStorage persistence
│   └── useAnimatedNumber.ts # RAF-based number animation
├── lib/
│   ├── storage.ts           # localStorage load/save/reset helpers
│   ├── score.ts             # Productivity score + tier + formatting
│   ├── roasts.ts            # Roast line generation + milestones
│   └── streak.ts            # Clean-day streak computation
└── components/
    ├── Dashboard.tsx        # Score hero + stat cards + charts layout
    ├── TaskManager.tsx      # Add/toggle/delete tasks
    ├── DistractionTracker.tsx  # Log distractions + Honest Mode entry
    ├── HonestMode.tsx       # Live timer + PANIC fake-work screen
    ├── ScoreRing.tsx        # Animated productivity ring
    ├── RoastBanner.tsx      # Contextual roast banner
    └── Charts.tsx           # Bar chart, donut, streak card, category bars
```

---

Built as a hackathon MVP. The point isn't to shame you — it's to make the shame *fun*.
