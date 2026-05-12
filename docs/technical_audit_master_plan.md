# Premium Technical SEO & Audit Automation Plan (B2B SaaS)

## 1. 비전 및 목표 (Vision & Goals)
- **목표:** 단순한 SEO 검사기를 넘어, 기업 타겟의 **"Technical Due Diligence(기술 실사) 리포트"** 자동 생성 엔진으로 진화.
- **가치 창출:** 초기 개발자, 스타트업 대표, 에이전시들이 외부에서 자사/타사 웹사이트의 품질을 파악할 수 있도록 돕는 프리미엄 서비스. (추가 과금 모델 구축 가능)
- **핵심 원칙:** "도메인 주소(URL) 단 하나"만으로 모든 데이터를 수집하되, 외부망 검사의 한계를 명확히 인지하고 **[확정 데이터]와 [추론(Inferred) 데이터]를 리포트에 투명하게 분리하여 기재**한다.

## 2. 세부 구현 목표 및 분석 분류 (Feature Roadmap)

해당 문서는 이전 개발사의 Taekworld 분석 리포트를 벤치마킹하여, 우리 자동화 툴에 탑재할 기능을 3가지로 엄격히 분류합니다.

### 🟢 [Phase 1] 100% 자동화 및 확정 가능한 지표 (Absolute Data)
*가장 우선적으로 스캔 엔진(`/api/scan`)에 통합할 기능입니다.*

1.  **성능 및 속도 (Performance & Core Web Vitals)**
    *   *내용:* Google PageSpeed Insights API를 통한 모바일/데스크탑 성능 점수, LCP, CLS, TBT, FCP 측정.
    *   *상태:* **완료 (현재 적용됨)**
2.  **보안 헤더 및 프로토콜 (Security & Headers)**
    *   *내용:* `Strict-Transport-Security (HSTS)`, `Content-Security-Policy (CSP)`, `X-Frame-Options`, `X-Content-Type-Options` 누락 여부 검사.
    *   *방법:* HTTP Response Header 분석.
3.  **접근성 (Accessibility & WCAG)**
    *   *내용:* 모바일 화면 확대 강제 차단 (`user-scalable=no` 혹은 `maximum-scale=1`) 여부 검사, `aria` 속성 사용 여부.
    *   *방법:* Cheerio를 통한 `<meta name="viewport">` 및 시맨틱 태그 파싱.
4.  **도메인 보안 및 이메일 신뢰성 (DNS & Email Auth)**
    *   *내용:* 스팸/사칭 방지를 위한 `SPF`, `DMARC` 레코드 등록 여부.
    *   *방법:* Node.js `dns.resolveTxt` 활용.

### 🟡 [Phase 2] 추론 가능한 지표 (Inferred Data) - *명시적 안내 필수*
*네트워크 흔적을 기반으로 "강력하게 추론"하며, 리포트에는 반드시 "외부 네트워크 풋프린트 기반 추론결과(Inferred from external footprint)"라는 경고 문구를 삽입합니다.*

1.  **서버 인프라 및 CDN 아키텍처 (Infrastructure)**
    *   *방법:* 응답 헤더의 `server`, `x-vercel-cache`, `cf-cache-status`, `x-powered-by` 등을 분석하여 Vercel, Cloudflare, AWS 등 호스팅 환경 추론.
    *   *방법:* `<video src="...">`, `<img>` 태그 주소를 분석하여 Vercel Blob 등 스토리지 사용 유무 파악.
2.  **렌더링 방식 추론 (CSR vs SSR/SSG)**
    *   *방법:* 초기 다운로드된 HTML의 바디 크기가 전체 로딩 후 DOM 크기에 비해 비정상적으로 작거나, `id="__next"` 혹은 `<div id="root">` 안에 시맨틱 태그가 전혀 없으면 "Client-Side Rendering 의존 (CSR Bailout 의심)"으로 추론.
3.  **개인정보 수집 리스크 (COPPA / Privacy Risk Indicator)**
    *   *방법:* HTML 내부에 `<input type="password">`, `name`, `email` 폼이 존재할 경우, "잠재적 개인정보 취급 사이트 - 연령 제한/동의 절차 확인 요망" 플래그 띄움.
4.  **프레임워크 및 라이브러리 (Tech Stack)**
    *   *방법:* 브라우저 소스코드의 `_next/static` 경로 확인 시 Next.js, `*.firebaseio.com` 노출 시 Firebase 사용으로 100%에 가까운 확률로 추론 가능.

### 🔴 [Out of Scope] 외부에서 절대 불가능한 지표 (Cannot Assess)
*고객에게 신뢰감을 주기 위해, 이전 개발사처럼 리포트 마지막 장(Appendix)에 "소스코드 접근 권한 없이는 분석 불가능한 영역"으로 당당히 명시하여 투명성을 높입니다.*

1.  **백엔드/API 내부 보안 (Backend API Security):** 파라미터 변조, SQL 인젝션 가능 여부.
2.  **데이터베이스 구조 및 최적화 상태 (DB Architecture):** PostGIS 사용 여부, 쿼리 성능.
3.  **Auth 토큰 탈취 내성 (Token Flow Integrity):** Refresh Token 주기, 서버사이드 검증 로직.
4.  **테스트 커버리지 및 코드 품질 (Code Quality/Debt).**

---

## 3. 다음 대화(새 세션)에서 진행할 실행 계획 (Action Plan)

새 대화방이 열리면 다음 순서대로 코드를 수정하고 업그레이드합니다.

*   **Step 1:** `/api/scan/route.ts` 고도화
    *   HTTP 요청 시 헤더(CSP, X-Frame-Options 등)를 모두 캡처하여 `securityJson`으로 저장.
    *   `dns` 모듈을 연동하여 도메인의 DMARC/SPF 레코드 확인.
    *   초기 HTML 응답 크기(SSR/CSR 판별) 및 CDN 헤더 분석기 추가.
*   **Step 2:** `scan_results` DB 스키마 업데이트
    *   추출된 고급 데이터(보안, 인프라, 추론 데이터)를 담을 신규 JSON 컬럼 확장 (`audit_json` 등).
*   **Step 3:** PDF 리포트 템플릿(PrintReportPage) 프리미엄화
    *   기존 UI를 확장하여 **Infrastructure**, **Security**, **Accessibility** 섹션 추가.
    *   "추론 데이터(Inferred)"에 대한 안내 문구 디자인 및 "분석 불가(Not Assessed)" 부록 페이지 추가.
