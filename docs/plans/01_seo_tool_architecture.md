# SEO Compass - Initial Product Plan & Architecture

## 1. CEO Agent: Product Vision & Strategy

### 1.1 Product Concept
**"SEO Compass"** is a highly visual, extremely simplified SEO guardrail and analysis tool. Instead of overwhelming users with dense technical metrics (like Ahrefs or Semrush), it translates technical SEO issues into "business-threatening risks" and "beginner mistakes." It specifically targets common structural pitfalls made by novice developers—such as dynamic URL explosion (which overloads databases and causes search engine rejection due to infinite duplicate indexing), missing canonicals, and improper sitemaps.

### 1.2 Target Users
- **Entry-Level Developers & Solo Founders:** Those who know how to build a basic app but lack understanding of search engine crawling behavior and SEO architecture.
- **Small Business Owners / Non-Tech Founders:** Users who need to know *what* is wrong in plain English before hiring or asking someone to fix it.

### 1.3 MVP Feature List
1. **The "Pre-Flight" SEO Scanner:** Input a URL, and get a simplified grade (Pass/Warning/Critical).
2. **Infinite Indexing / Duplicate Risk Detector:** Scans for unhandled dynamic parameters (e.g., `?keyword=abc`, `?keyword=abcd`) to warn about search engine penalties and DB load.
3. **Robots.txt & Sitemap Validator (With Actionable Fixes):** Explains what is currently being blocked or allowed in plain language, and provides direct "Copy & Paste" code snippets to fix the configuration (e.g., "Replace your current robots.txt with this code to allow Googlebot").
4. **"Noob-Friendly" Direct Solutions & Fallbacks:** Translates issues into beginner terms AND provides the exact code needed to fix it. It proactively asks the user for necessary context (e.g., "What is your main domain name?"), and if the user doesn't provide it, offers a fallback template with clear instructions on where to paste it.
5. **Project History & Reports:** Save basic scan histories to show improvement over time.

### 1.4 Technical Architecture
- **Framework:** Next.js (App Router) for both Frontend and Backend API routes.
- **Styling:** Tailwind CSS + UI components (e.g., shadcn/ui) for a clean, modern, and trust-inspiring dashboard.
- **Database & Storage:** Cloudflare D1 (Serverless SQLite) for relational data and Cloudflare R2 for asset storage (using Drizzle ORM).
- **Crawling/Analysis Engine:** Cheerio (for fast, static HTML parsing) running on Edge/Serverless functions to minimize compute costs. Deep crawling is intentionally restricted.
- **Localization (i18n) & Dynamic Translation (AppFactorys Standard):** 
  - **Static UI:** `next-intl` for English (Default), Korean, Japanese, and Spanish.
  - **Dynamic Content:** **Google Gemini API** (`GEMINI_API_KEY`) is used for translation. 
  - **User-Triggered Lazy Caching Pattern:** If dynamic content is untranslated, the UI displays a "Translate for Free" box/button. Upon user click, the app calls Gemini API, displays the result, and permanently saves the translation to Cloudflare D1 to eliminate future API costs.
- **Hosting & Domain:** Vercel (Frontend & Serverless APIs) + Cloudflare Ecosystem (D1 + R2). Target domain for MVP: `seo.appfactorys.com`.

### 1.5 Development Milestones
- **Milestone 1: Foundation & Scaffold** (Setup repo, DB, Auth, and base UI components).
- **Milestone 2: Core Analysis Engine** (Implement backend logic to fetch URLs, parse Meta tags, Sitemaps, and detect duplicate risks).
- **Milestone 3: User Dashboard & Reporting** (Connect engine to frontend, visualize risks with traffic-light UI, simple language).
- **Milestone 4: Payments & Launch Prep** (Stripe integration for paid tiers, final QA).

### 1.6 Agent Roles for Multi-Agent Orchestration
In an "AppFactorys" model, different AI Personas handle specific parts of the project:
1. **CEO Agent:** Defines the 'Why' and the business logic. Keeps the project aligned with the target audience.
2. **Product Manager (PM) Agent:** Breaks the CEO's vision into actionable, bite-sized Jira-style tickets.
3. **Architect Agent:** Defines the 'How'. Designs folder structures, database schemas, and data flow.
4. **Frontend Agent:** Translates UI/UX designs and PM tickets into React/Tailwind code. Focuses solely on user experience.
5. **Backend Agent:** Implements API routes, crawling logic, DB transactions, and error handling.
6. **QA/Review Agent:** Reviews code for bugs, performance issues, and ensures the original requirements are met.

---

## 2. Product Manager Agent: Development Tickets

Here is the breakdown of the MVP into executable tickets for Coding Agents.

### EPIC 1: Foundation Setup
- **TICKET-1.1:** Initialize Next.js 16+ App Router project with Tailwind CSS and TypeScript.
- **TICKET-1.2:** Setup basic layout structure (Sidebar, Header, Main Content area).
- **TICKET-1.3:** Configure Cloudflare D1 Database and Drizzle ORM schema (Tables: `User`, `Project`, `ScanResult`). Setup R2 storage bindings.

### EPIC 2: Core SEO Analyzers (Backend)
- **TICKET-2.1:** Create `analyze-meta` API route using `cheerio` to extract Title, Description, H1, and Canonical tags.
- **TICKET-2.2:** Create `analyze-sitemap` API route to validate `robots.txt` and `sitemap.xml` presence and format.
- **TICKET-2.3:** Create `detect-dynamic-risk` logic (Algorithm to detect repetitive structural patterns or infinite parameter loops that cause DB overload / SEO duplicate rejection).

### EPIC 3: Dashboard & UX (Frontend)
- **TICKET-3.1:** Build the "New Scan" input component (URL bar with loading states and animation).
- **TICKET-3.2:** Build the "Traffic Light" Summary component (Green = Good, Yellow = Warning, Red = Critical Risk).
- **TICKET-3.3:** Build the "Issue Detail Card" component (Displaying "Technical Issue" alongside "Beginner Translation" and "How to fix").

### EPIC 4: Paid Features & Finalization
- **TICKET-4.1:** Integrate Stripe Checkout for a "Premium Scan" or "Multiple Projects" tier.
- **TICKET-4.2:** Build User Dashboard to list past scans and historical scores.

---

## 3. Architect Agent: System Design

### 3.1 Folder Structure (Next.js App Router)
```text
/src
  /app
    /api
      /scan               # API: Triggers the main SEO analysis
      /projects           # API: CRUD for user projects
    /(auth)               # Auth related pages (login, register)
    /dashboard            # Main user dashboard
      layout.tsx
      page.tsx
    /report/[id]          # Detailed SEO report page
    layout.tsx            # Root layout
    page.tsx              # Landing page
  /components
    /ui                   # Reusable UI components (buttons, cards)
    /seo                  # SEO-specific components (RiskGauge, IssueCard)
  /lib
    /analyzers            # Core logic (metaParser.ts, sitemapValidator.ts)
    db.ts                 # Database connection instance
    utils.ts              # Helper functions
  /types                  # TypeScript interfaces (ScanResult, Project)
```

### 3.2 Data Flow
1. **Input:** User submits `https://example.com` on the Frontend Dashboard.
2. **Request:** Frontend sends POST request to `/api/scan` with the URL.
3. **Processing (Backend):**
   - The `/api/scan` route concurrently calls internal analyzer functions in `/lib/analyzers`.
   - `metaParser` fetches the HTML and evaluates Title/Description/Canonical.
   - `sitemapValidator` checks for standard robots/sitemap files.
   - `dynamicRiskDetector` evaluates URL patterns for duplicate explosion risks.
4. **Storage:** The aggregated result is saved to the Cloudflare D1 database via Drizzle ORM.
5. **Response:** API returns the structured JSON report to the frontend.
6. **Rendering:** Frontend translates JSON into visual UI (Green/Yellow/Red indicators, beginner-friendly text).

### 3.4 Cloudflare D1 (SQLite) Constraints & Mitigation Strategy
Since all data resides in D1 (SQLite), the PM and Backend Agents must strictly enforce the following rules to prevent database crashes, lockouts, or performance degradation:

1. **Mandatory Pagination (No Unbound Queries):** SQLite can choke on fetching massive rows. **Rule:** Every `SELECT` query returning a list MUST include a `LIMIT` (e.g., `LIMIT 20`). Never use `SELECT * FROM table` without limits.
2. **Write-Lock Prevention (Concurrency):** SQLite handles reads beautifully but locks the DB during writes. **Rule:** Scan results should be inserted quickly and cleanly. Avoid long-running transactions. If bulk inserting, use batch statements.
3. **Index & Search Limitations:** Multi-keyword searches using `LIKE '%word%'` will break indices and cause full table scans. **Rule:** Avoid complex LIKE queries. Ensure foreign keys (like `user_id`, `project_id`) are explicitly indexed. If search is needed, strictly index the exact match column or implement SQLite FTS5 explicitly.
4. **Data Type Strictness:** SQLite stores dates and booleans as strings or integers. **Rule:** Use **Drizzle ORM** combined with **Zod** to strictly parse and validate types at the application layer before touching the DB. JSON objects should be serialized carefully.

### 3.3 Core Libraries
- **Framework:** `next` (React framework), `react`, `react-dom`
- **Scraping & Parsing:** `cheerio` (Fast HTML parsing), `axios` or native `fetch` (HTTP requests)
- **Database & ORM:** `prisma` or `drizzle-orm`, `@supabase/supabase-js` (or similar for auth/db)
- **Styling & UI:** `tailwindcss`, `lucide-react` (Icons), `framer-motion` (Micro-animations for premium feel), `clsx`, `tailwind-merge`
- **Validation:** `zod` (API payload and environment variable validation)
