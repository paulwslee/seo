# Premium B2B Consulting Deck Architecture

## 1. Goal
Transform the technical SEO report into a premium, dynamically generated presentation deck (Pitch Deck) using Gemini 2.5 Flash.

## 2. Dynamic Slide Schemas (JSON Output)
The backend (`api/scan/route.ts`) will instruct Gemini to return a structured JSON object representing the slides, precisely tailored to the target URL's business model.

### 2.1 Core Slides
- **Cover Page**
- **Release Readiness by Use Case**
- **Category Scores & Checklists**
  - Accessibility, Infrastructure, Content & Structure, Security, Performance.
  - *New:* Includes verification of basic compliance: Contact info, Terms of Service (ToS), Privacy Policy.

### 2.2 Detailed Blocker Slides
- For each critical issue, generate a dedicated "BLOCKER" slide.
- Includes: Title, Dev Spec (Fix instructions), and Terminal Verification Command (`curl`, `grep`, etc.).

### 2.3 Strategic Roadmaps
- **Projected Score Trajectory:** Estimate how the score will improve after each sprint.
- **Phase 2 Architecture Roadmap:** Scaling recommendations (e.g., beyond 10K users).
- **Industry Precedent / Case Studies:** Automatically infer the URL's industry (SaaS, EdTech, E-commerce) and provide relevant tech stack examples from industry leaders.

### 2.4 Legal & Compliance
- **COPPA Exposure Assessment:** AI will dynamically assess if the target site requires COPPA compliance (e.g., targeting minors, collecting telemetry).
- **Legal Counsel Recommendations:** Status and next steps for engaging privacy counsel.
- **Appendix: Blind Spots:** A table of what cannot be assessed without source code access.

### 2.5 Localization & Tone ("Our Own Flavor")
- AI explanations, advice, and analysis expressions will be generated in the user's selected language (e.g., Korean, English).
- The tone will be authoritative, professional, and highly actionable (Premium Consulting Firm tone).

---

## 3. Implementation Phases

### Phase 1: API Prompt & JSON Schema Redesign
1. Update Python crawler to explicitly look for Terms, Privacy Policy, and Contact Info links.
2. Rewrite `api/scan/route.ts` Gemini prompt. Shift from generating a `<markdown_report>` to a massive, validated `JSON schema`.
3. Test JSON parsing and error handling.

### Phase 2: Frontend Slide Components (Core & Categories)
1. Build `<ReadinessTableSlide>` for Use Cases.
2. Update existing Category slides to include the new Compliance checks (ToS, Privacy).

### Phase 3: Frontend Slide Components (Blockers & Roadmaps)
1. Build `<BlockerSlide>` with the dark Terminal UI box.
2. Build `<TrajectorySlide>`, `<ArchitectureSlide>`, `<IndustryPrecedentSlide>`.

### Phase 4: Compliance & Polish
1. Build `<CoppaSlide>`, `<LegalSlide>`, `<AppendixSlide>`.
2. Inject the dynamic Glossary.
