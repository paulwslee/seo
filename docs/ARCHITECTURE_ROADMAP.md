# App Factory Architecture Roadmap

## Phase 1: Standalone Services (Current)
Currently, `seo.appfactorys.com` operates as a Monolith for its own database.
- Uses its own D1 SQLite database.
- Stores its own `users`, `accounts`, and `apiUsageLogs` locally.
- Authentication (OAuth) is handled directly by this Next.js application.

## Phase 2: Centralized Identity & Billing Hub (SSO)
As the App Factory ecosystem grows (e.g., adding `summarizer.appfactorys.com`), maintaining separate databases for every application will lead to fragmented user experiences and redundant database migrations.

To solve this, we will transition to a **Centralized Microservice Architecture**:

### 1. The Core Hub (`account.appfactorys.com` or `api.appfactorys.com`)
A dedicated domain will be established to act as the single source of truth for Identity (SSO) and Billing.
- **Unified Database**: The D1 database containing `users`, `accounts`, `sessions`, and `apiUsageLogs` will be extracted from the SEO Compass project and hosted exclusively by this central hub.
- **Single Sign-On (SSO)**: Users will authenticate once through this hub via OAuth (Google, Apple, Kakao). The hub will issue a secure JWT that all other App Factory applications will trust.
- **Global Credits**: A unified credit/billing system. Users purchase "App Factory Credits" which can be consumed by any service in the ecosystem.

### 2. Client Applications (`seo.appfactorys.com`, etc.)
Individual services will become "Stateless Clients" regarding user identity.
- **No Local User DB**: They will no longer maintain their own `users` tables.
- **Token Verification**: They will verify the JWT provided by the Core Hub.
- **API Usage Reporting**: Instead of writing to a local SQLite database, they will make an internal REST API call (e.g., `POST https://api.appfactorys.com/v1/logs/usage`) to deduct credits and record metrics.

### 3. Benefits of this Architecture
- **Frictionless Onboarding**: A user who signed up for SEO Compass is instantly registered for all future App Factory tools.
- **Development Speed**: New applications can be bootstrapped instantly without configuring NextAuth, OAuth Providers, or Drizzle schemas. They simply point to the Hub.
- **Centralized Admin Dashboard**: The "App Factory Global Analytics" and "User Management" tabs currently residing in the SEO Compass Admin panel will be migrated to the Core Hub, providing true global visibility.

### Migration Strategy
1. **Stabilize Phase 1 (Current)**: Ensure the local D1 schema and `apiUsageLogs` perfectly capture the necessary metrics within the SEO Compass app.
2. **Extract Database**: Move the Drizzle schema and D1 binding to the new Hub repository.
3. **Establish SSO API**: Create OIDC-compliant endpoints or shared JWT secret infrastructure on the Hub.
4. **Refactor SEO Compass**: Swap out local `@/lib/db` calls for `fetch()` requests pointing to the Hub API.
