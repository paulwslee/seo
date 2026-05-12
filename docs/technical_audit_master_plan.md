# Enterprise SEO Technical Audit - Master Plan

## 1. System Architecture: The "True Deep Scan" Pipeline
To transcend basic surface-level metrics and deliver a 10+ page B2B Enterprise Audit, we are decoupling the crawling engine from Next.js and introducing a robust, highly scalable Python Microservice.

### A. Python Deep Crawler (FastAPI + Playwright on Google Cloud Run)
- **Why Python/Cloud Run:** 
  - **Cost:** Practically $0 for the first ~6,000 scans/month due to GCP Free Tier. Fractions of a cent thereafter. Vastly cheaper and more scalable than Browserless/Apify.
  - **No Timeouts:** Bypasses Vercel's strict serverless timeout limits, allowing for deep, multi-page crawling.
- **Capabilities:**
  - **Depth Crawling:** Extracts internal `<a>` tags and visits 3-5 subpages to ensure stability beyond just the homepage (e.g., catching CSR bailouts on sub-routes).
  - **Network Interception:** Captures all XHR/JS requests to identify third-party media hosts (Vimeo, S3) and CDN architectures.
  - **Secret Key Scanning:** Utilizes a comprehensive Regex dictionary to scan all downloaded `.js` files and console logs for exposed API keys (Firebase, AWS, Stripe, GitHub, SendGrid, etc.).

### B. AI Content Generation (Gemini 2.5 Flash)
- **The Role of AI:** Instead of static boilerplate text, the raw JSON payload from the Python Crawler is fed directly to Gemini 2.5 Flash.
- **Output:** Gemini acts as a Senior Technical SEO Consultant, generating:
  1. An Executive Summary (High-level business impact).
  2. Deep narrative analysis for Frontend, Backend, and Performance.
  3. Actionable Remediation Plans (Why it matters, how to fix it).

### C. Auto-Learning Glossary System (DB: seo_glossary)
- **Problem:** Enterprise reports contain jargon (LCP, CLS, TBT, TTFB, Hydration) that standard users do not understand.
- **Solution:** 
  - Gemini extracts a list of technical terms used in its generated report.
  - Next.js cross-references this list with our internal `seo_glossary` database table.
  - **Cache Hit:** Append our stored, highly curated definition to the PDF Appendix.
  - **Cache Miss:** Ask Gemini to define the new term, save it to the database (growing our proprietary asset library), and append it to the report.

## 2. PDF Report Structure (Target: 10+ Pages)
1. **Cover Page**
2. **Executive Summary** (AI Generated)
3. **Method & Scope** (Dynamic depth metrics)
4. **Overall Verdict & Score Interpretation**
5. **Deep Dive: Frontend Architecture** (Subpage consistency, Hydration)
6. **Deep Dive: Backend & Infrastructure** (Network topology, Video streaming hosts)
7. **Deep Dive: Core Web Vitals** (Page 1 vs Subpages)
8. **Security Assessment & API Leakage** (Exposed keys, CSP, Headers)
9. **Critical Blockers & Action Plan** (Prioritized by AI)
10. **Historical Trend Analysis**
11. **Appendix A: Glossary of Terms** (Auto-Learning Dictionary)
12. **Appendix B: Transparency & Limitations**

## 3. Next Execution Steps
1. **Step 1:** Define the `seoGlossary` schema in Drizzle ORM and push it to the database.
2. **Step 2:** Scaffold the Python FastAPI Microservice locally (`/seo-crawler` directory) with Playwright and the API Key Regex library.
3. **Step 3:** Create the orchestration logic in `src/app/api/scan/route.ts` to call the Python crawler, then pass the data to Gemini, handle the Glossary DB lookups, and save the final report object.
4. **Step 4:** Update the React PDF renderer to dynamically map the Gemini-generated Markdown into the new 10+ page layout.
