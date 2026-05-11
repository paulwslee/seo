# Frontend Architecture & UI Strategy (Phase 2)

## 1. UI/UX Core Philosophy
The frontend of SEO Compass is designed to alleviate the anxiety of entry-level developers and small business owners when dealing with SEO.
- **Visual Over Text:** Minimize raw numbers and dense tables. Maximize color-coded visual cues (Traffic Lights).
- **Copy & Paste Driven:** Users should not need to search Google for "how to fix missing canonical". The UI provides the exact code snippet with a "Copy" button.
- **Premium Aesthetics:** Clean, modern design supporting both **Light and Dark mode** (System default with user override capability). Utilizing Tailwind CSS, `shadcn/ui`, and subtle `framer-motion` animations.
- **Typography & Layout Constraints:** Strict prevention of "orphan words" or awkward 2-line wraps on desktop (FHD+) screens. Use ample `max-w-4xl+` containers and `md:whitespace-nowrap` for subtitles to maintain horizontal stability.

## 2. Component Design System

### 2.1 The "Traffic Light" Indicator (RiskGauge)
Instead of a score out of 100, we categorize issues into three actionable levels:
- 🟢 **PASS (Safe):** SEO best practices met. (e.g., Robots.txt exists and allows indexing).
- 🟡 **WARNING (Sub-optimal):** Not fatal, but limits growth. (e.g., Missing Meta Description).
- 🔴 **CRITICAL (Fatal):** Active penalty or index rejection risk. (e.g., Infinite dynamic parameters without canonicals, blocking robots).

### 2.2 The "Fix It" Card (IssueCard)
A structured component displayed when a WARNING or CRITICAL issue is found.
- **Title:** Beginner-friendly translation of the error.
- **Technical Context:** Expandable area for the actual technical error (for those who want to know).
- **Action Box:** A direct code snippet or instruction.
- **Fallback Template:** "If you don't know your domain, replace `[YOUR_DOMAIN]` with your actual website link."

## 3. Directory Structure (App Router)
```text
/src
  /app
    /dashboard            # The main logged-in view
      /layout.tsx         # Sidebar (Navigation) + Topbar
      /page.tsx           # URL input and recent scans
      /[id]/page.tsx      # Specific scan report view
  /components
    /ui                   # Pure shadcn/ui components (buttons, inputs)
    /seo                  # Custom domain components (TrafficLight, IssueCard)
    /layout               # Sidebar, Header components
```

## 4. State Management
- **Server Components (RSC):** Default approach for data fetching (fetching past scans from D1).
- **Client Components:** Used strictly for interactive elements (URL Input forms, copy-to-clipboard buttons, animation wrappers).
