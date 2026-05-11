# 🏭 AppFactorys - Global Standard Blueprint

이 문서는 **AppFactorys**에서 생산되는 모든 차기 애플리케이션 프로젝트들이 반드시 따라야 하는 **공통 초기화 가이드라인 및 핵심 아키텍처 표준**을 정의합니다. (최초 작성: SEO Compass 프로젝트 진행 중 도출된 표준)

---

## 1. 🎯 Core Philosophy (핵심 철학)
1. **모든 것은 서류화 (Document Everything):** 코딩보다 문서화가 우선입니다. `docs/plans`와 `docs/tasks/PROGRESS_TRACKER.md`를 통해 에이전트 간의 작업 히스토리와 컨텍스트를 영구적으로 보존합니다.
2. **초직관적 UI/UX (Ultra-Intuitive):** 구글 검색창처럼 핵심 액션(예: URL 입력) 하나에만 집중할 수 있도록 첫 화면의 군더더기를 모두 제거합니다. 복잡한 수치 대신 직관적인 **신호등(초록/노랑/빨강) 디자인**을 기본으로 채택합니다.
3. **Copy & Paste 지향:** 에러 메시지나 기술적 경고를 띄울 때는 반드시 초보자도 이해할 수 있는 쉬운 언어로 번역하고, 클릭 한 번에 복사해서 해결할 수 있는 **[해결 코드 제공 박스]**를 기본 탑재합니다.
4. **UX 디테일 강제 (Cursor Pointer):** 클릭 가능한 모든 객체(버튼, 링크, 드롭다운 등)는 마우스 오버 시 반드시 커서가 손가락 모양으로 변해야 합니다(`cursor-pointer` 강제). 기본값에 의존하지 않고 명시적으로 적용하여 사용자 피드백을 확실히 줍니다.
5. **안전망 지향 (Step-by-step Commits):** 새로운 기능이 추가되거나 코드가 수정되는 각 단계마다 반드시 Git Commit을 수행하여 히스토리를 남깁니다. Push는 나중에 한 번에 하더라도, 언제든 문제가 발생한 지점으로 즉시 롤백(Rollback)할 수 있는 안전망을 확보해야 합니다.
6. **[NEW] 통합 API 트래킹 (Central API Auditing):** 향후 AppFactorys 산하의 모든 앱은 LLM 등 과금형 API 호출 시 반드시 **[누가(실제 유저+서비스명), 어디서, 무엇을, 얼마나 오래, 얼마의 비용으로]** 사용했는지 추적하여 중앙 DB에 로깅해야 합니다. 이는 본사 통합 관리와 개별 앱 서비스단 양쪽에서 모두 확인할 수 있어야 합니다.

## 2. 🛠 Core Tech Stack (공통 기술 스택)
- **Framework:** `Next.js 16+` (App Router)
- **Styling & UI:** `Tailwind CSS v4` + `shadcn/ui` + `Lucide React` (다크/라이트 모드 시스템 연동 필수 적용)
- **Database:** `Cloudflare D1` (Serverless SQLite)
- **Storage:** `Cloudflare R2`
- **ORM:** `Drizzle ORM`
- **Hosting:** `Vercel` (Frontend/Edge) + `Cloudflare Ecosystem`

## 3. 🌐 다국어 및 번역 표준 (i18n & Lazy Translation)
AppFactorys의 모든 글로벌 앱은 **글로벌 기본 언어(영어) + 1순위 타겟(한국어, 일본어, 스페인어 등)**을 지원하며, API 비용을 극소화하는 다음 패턴을 표준으로 삼습니다.

1. **정적 UI 번역 (`next-intl`):** 메뉴, 버튼, 기본 레이아웃 텍스트는 `next-intl`을 사용해 로컬 파일 기반으로 비용 없이 렌더링합니다.
2. **동적 결과 번역 (User-Triggered Lazy Caching Pattern):**
   - 사용자 스캔 결과나 동적 에러 메시지가 번역되어 있지 않을 경우, 원문(영어)을 표시하되 **[무료 번역 도구 (Translate for Free)]** 버튼을 노출합니다.
   - 사용자가 이 버튼을 클릭할 때만 **Google Gemini API**를 호출하여 번역합니다.
   - **중요:** 번역된 결과는 즉시 **Cloudflare D1에 영구 캐싱(저장)**하여, 다음 사용자가 동일한 오류를 겪을 때는 API 비용 없이 0.1초 만에 번역된 텍스트를 제공합니다.

## 4. 🗄 Database 안전 규칙 (D1 / SQLite 제약사항)
모든 앱은 Cloudflare D1 환경에서 동작하므로 다음 데이터베이스 규칙을 강제합니다:
- **Pagination 필수:** 모든 `SELECT` 리스트 조회에는 반드시 `LIMIT`를 적용하여 메모리 폭주를 막습니다.
- **Write-Lock 회피:** 대량의 데이터 삽입(Insert) 시에는 트랜잭션을 최소화하고 Batch 처리를 수행합니다.
- **Full Table Scan 금지:** 무분별한 `%키워드%` `LIKE` 검색을 피하고, 철저히 인덱싱된 키(예: `user_id`, `project_id`)를 활용합니다.

## 5. 🤖 Multi-Agent Orchestration (AI 협업 워크플로우)
인간(대표)과 AI(에이전트)의 협업은 Auto-GPT 방식의 무분별한 자율 코딩이 아닌, **Human-in-the-loop (인간 결재형 순차 진행)** 방식을 표준으로 합니다.
1. **CEO Agent:** 제품 방향성과 타겟 페르소나 설정
2. **Architect Agent:** 시스템 설계, 폴더 구조, 데이터베이스 스키마 정의 (`docs/plans/...` 작성)
3. **PM Agent:** 작업을 티켓 단위로 분할하여 `PROGRESS_TRACKER.md`에 등록
4. **Developer Agents:** 승인된 티켓과 설계도를 바탕으로 코드 구현 및 UI 렌더링

## 6. 🌍 Domain & Branding Strategy (하이브리드 도메인 전략)
모든 AppFactorys 프로덕트는 초기 비용을 줄이고 도메인 점수(SEO)를 집중하기 위해 다음 전략을 따릅니다.
1. **MVP 검증 단계 (Subdomain):** 모든 신규 앱은 `[app-name].appfactorys.com` 형태로 출시하여 시장 반응을 테스트합니다. (예: `seo.appfactorys.com`)
2. **스케일업 단계 (Standalone):** 유의미한 결제 전환율(MRR)이 발생하고 프로덕트 마켓 핏(PMF)이 검증되면, 즉시 독립 도메인(예: `seocompass.com`)을 구매하여 분리 브랜딩 및 추후 매각(Exit)을 준비합니다. 기존 서브도메인은 독립 도메인으로 301 Redirect 처리하여 트래픽 손실을 방지합니다.

> 💡 **업데이트 가이드:** 새로운 프로젝트를 진행하면서 발견되는 좋은 라이브러리, 새로운 AI 프롬프트 노하우, 수익화 패턴(Stripe 연동법 등)이 있다면 이 문서에 지속적으로 추가해 나갑니다.
