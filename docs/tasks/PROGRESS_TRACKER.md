# SEO Compass - Progress Tracker

## 🎯 Project Overview
- **Name:** SEO Compass
- **Goal:** A simplified, visual SEO guardrail tool for beginners and small business owners.
- **Key Philosophy:** Provide direct, copy-pasteable solutions and translate complex technical SEO issues into plain business risks (e.g., Red/Yellow/Green traffic lights).
- **App Factory Standard (i18n):** User-triggered Lazy Translation. Untranslated dynamic content shows a "Free Translate" button. Clicks trigger the Google Gemini API, display the result, and permanently cache it in the Cloudflare D1 database.

## 📊 Current Status
- **Current Phase:** Phase 2 - Frontend Architecture & UI Design
- **Last Updated:** 2026-05-10
- **Next Action:** Initialize the Next.js frontend project and design the core UI components.

## 🚀 Milestone Tracking

### Phase 1: Planning & Architecture (✅ Completed)
- [x] Define Product Concept & Target Audience.
- [x] Establish MVP Feature List (Focus on actionable fixes & fallbacks).
- [x] Design Technical Architecture (Next.js, Tailwind, Cloudflare D1/R2, Cheerio).
- [x] Break down PM Tickets.
- **Related Docs:** `docs/plans/01_seo_tool_architecture.md`

### Phase 2: Frontend Design & Foundation (✅ Completed)
- [x] Initialize Next.js 16+ App Router project.
- [x] Configure Tailwind CSS & shadcn/ui.
- [x] Design Folder Structure for UI Components.
- [x] Create basic Layout (Sidebar, Header, Main Dashboard).
- [x] Design "Traffic Light" SEO Risk components.
- **Related Docs:** `docs/plans/02_frontend_architecture.md`

### Phase 3: Core Analyzers & Backend (🔄 In Progress)
- [x] Setup Cloudflare D1 Database & R2 Storage (Drizzle ORM).
- [x] Integrate Auth.js (NextAuth v5) for Social Logins.
- [x] Implement initial `/api/scan` with Gemini AI Actions.
- [ ] Implement `scan_results` DB saving logic for logged-in users.
- [ ] **[NEW]** AppFactorys Global API Tracking System: Centralized DB logging for LLM/API usage (Who, Service, Cost, Duration).

### Phase 4: Integration & Launch Prep (⏳ Pending)
- [ ] Connect Frontend Dashboard with Backend APIs.
- [ ] Integrate Stripe for Premium features.
- [ ] Final QA and Vercel Deployment.

## 📝 Session Continuation Notes (For Returning Agents)
*If you are an AI reading this in a new session:*
- **Context:** The infrastructure is solid (i18n, NextAuth v5, D1, Drizzle, Gemini AI). The advanced SEO UI is live.
- **Immediate Task (Tomorrow):** 
  1. Complete the `scan_results` DB logic so logged-in users have their scan history saved.
  2. Implement the **AppFactorys API Usage Tracker**. Create a new D1 schema (`api_usage_logs`) that records every API call (especially Gemini LLM) with details: User, Service Name, Prompt type, Duration, and estimated Cost. This must be a centralized standard for all future apps.
