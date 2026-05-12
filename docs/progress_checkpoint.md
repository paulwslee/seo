# SEO Compass Reporting Pipeline & Crawler Architecture

This document summarizes the technical progress and architectural decisions made for the SEO Compass reporting system and its associated Python crawler.

## 1. Core Achievements

### A. Professional B2B Report Generation
*   **White-Label Integration:** Replaced generic "AI Deep Analysis Appendix" headings with dynamically injected `{companyName} Technical Audit Breakdown` to support agency-level white-labeling.
*   **AI Markdown Synthesis:** Integrated `gemini-2.5-flash` to generate exhaustive 15+ page technical due diligence reports directly from deep-crawl data and Google PageSpeed Insights (PSI).
*   **Cryptographic Sealing:** Implemented a SHA-256 evidence hash attached to the raw telemetry, providing non-repudiation for the technical data driving the AI analysis.

### B. Python Deep Crawler (`crawler/main.py`)
*   **Depth Capabilities:** Configured to scan the root URL (Depth 1) and up to 3 internal sub-pages (Depth 2). This depth is intentionally limited to 3 to prevent Vercel/Next.js API timeouts while remaining deep enough to catch Client-Side Rendering (CSR) bugs and leaked API keys.
*   **Specific Page Targeting:** Fixed an issue where the crawler only hit the root domain (`baseUrl`). The API (`src/app/api/scan/route.ts`) now passes the exact URL (e.g., `https://dev.taekworld.com/masters/Dbexists...`) directly to the Python crawler for highly targeted deep scanning.

### C. UI & User Flow Optimizations
*   **Target Language Selector:** Added a dropdown on the main UI allowing users to explicitly select the AI report language (English, Korean, Japanese, Spanish) *before* scanning, independently of the UI locale.
*   **Auth-Gated Language Selector:** The Language Selector is visually tied to the "Technical Audit (45s)" premium toggle. Clicking the selector when disabled automatically prompts the user to log in and activates the Technical Audit toggle.
*   **Deep URL Report Rendering:** Resolved a "Project not found or unauthorized" error when attempting to print reports for deep URLs. The system now searches `scanResults` by exact `url` rather than relying on the root `projects.domain` match, ensuring deep-link audits print perfectly.

## 2. Technical File Map

*   **`src/app/api/scan/route.ts`**: The core API pipeline. Coordinates fetch fallbacks, PSI, the Python Deep Scanner, and Gemini 2.5 Flash report generation. 
*   **`src/app/[locale]/page.tsx`**: Main landing UI containing the localized scanner input, language selector, and Premium Audit toggles.
*   **`src/app/[locale]/dashboard/reports/print/page.tsx`**: The headless PDF print rendering view. Fetches DB `scanResults` and parses the AI markdown for professional display.
*   **`crawler/main.py`**: The Playwright-based async Python crawler. Handles network interception, API key leak detection, and COPPA compliance keyword checking.

## 3. Next Steps & Pending Tasks (For Home Session)

1. **PDF Pagination & Layout:** Fine-tune the CSS `@media print` rules in `print/page.tsx` to ensure long markdown tables or AI code blocks don't awkwardly break across pages.
2. **Report Generator Modal Styling:** Polish the "Custom Logo" and "Company Name" inputs in the `ReportGeneratorModal` so the white-label UX feels premium.
3. **Database Maintenance:** Address pending TypeScript errors across `drizzle-orm` queries, specifically fixing minor type mismatches (e.g., `value: string | null` vs `SetStateAction<string>`) in the UI components.
4. **Glossary Extraction Review:** Check if the automatic 5-term glossary extraction running in `route.ts` is accurately populating the `seoGlossary` table without timing out.
