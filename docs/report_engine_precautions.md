# SEO Reporting Engine - Maintenance & Precautions

본 문서는 SEO 리포팅 엔진(특히 Print Report 페이지와 AI 스캔 로직)을 개발/유지보수하며 발견된 **핵심 주의사항(Hazards)**과 **아키텍처 규칙**을 정리한 것입니다. 추후 리포트 항목을 추가하거나 스캔 로직을 변경할 때 반드시 참고해야 합니다.

## 1. AI 프롬프트 스키마와 UI 매핑 동기화 (MOCK 데이터 노출 주의)
가장 흔히 발생할 수 있는 치명적 버그는 **실제 스캔을 돌렸음에도 UI에 하드코딩된 가짜 데이터(Mock Data)가 노출되는 현상**입니다.
* **원인**: UI(`page.tsx`)는 특정 객체 구조(`deck.categories.infrastructure.checks`)를 기대하지만, 백엔드(`route.ts`)의 Gemini AI 프롬프트에 해당 JSON 스키마 명세가 누락되어 AI가 값을 생성하지 않을 때 발생합니다.
* **해결 및 규칙**: UI에 새로운 동적 데이터를 추가할 경우, **반드시 `src/app/api/scan/route.ts` 내부의 AI 프롬프트 JSON 스키마(`prompt`)에도 해당 객체의 명세를 똑같이 추가**해야 합니다.
  * 예: `categories` 항목 누락 시, AI가 `deck` 안에 `categories`를 생성하지 않으므로 UI는 즉각 하드코딩된 fallback 배열(`|| [...]`)을 렌더링해버립니다.

## 2. 페이지네이션 (Total Pages) 계산의 무결성
리포트 우측 하단에 출력되는 `[현재 페이지] / [전체 페이지]` 로직은 매우 민감하게 동작합니다.
* **초기값 주의**: `page.tsx`에서 `let totalPages = 1;` 로 선언되어 있습니다. 이는 첫 장인 **Cover Slide**를 미리 계산한 것입니다. 따라서 조건부 페이지들을 더할 때 커버 페이지를 중복으로 더하지(`+= 4` 대신 `+= 3` 사용 등) 않도록 극도로 주의해야 합니다.
* **빈 배열(Empty Array) 방어**: `deck.warnings`, `deck.blockers` 등의 배열을 기반으로 페이지를 추가할 때는 **반드시 `.length > 0` 조건**을 걸어야 합니다. 배열이 비어있음에도 계산식에서 `+1`이 되어버리면, 실제 렌더링된 컴포넌트 횟수(`currentPage++`)와 전체 페이지 수(`totalPages`)가 어긋나 `32 / 33` 같은 버그가 발생합니다.
* **동적 렌더링 규칙**: 화면에 그려지는 모든 개별 `<Slide>` 컴포넌트는 **반드시 `pageNum={currentPage++}` 속성**을 가져야만 순서가 정확히 매겨집니다.

## 3. 이중 문자열화(Double-Stringified) JSON 방어
Gemini AI가 복잡한 JSON(특히 배열 내 객체 구조)을 반환할 때, 이따금 객체를 한 번 더 문자열(String)로 감싸버리는 환각(Hallucination) 현상이 발생합니다.
* **발생 위치**: `GlossarySlide` 등 AI가 사전적 정의를 배열로 내려줄 때 자주 관측됨.
* **대응책**: 단순히 `JSON.parse`를 사용할 경우 `SyntaxError`가 발생하며 전체 페이지 렌더링이 죽어버릴(White Screen) 위험이 있습니다. `PrintSlides.tsx` 내의 `parseGlossaryItem` 함수처럼 **Regex와 방어적 파싱 로직**을 사용하여, 데이터 형식이 깨져 들어오더라도 UI가 터지지 않게(Fail-safe) 보호해야 합니다.

## 4. 실측 데이터(CWV)와 정적 데이터의 점수 혼합 (Blending)
Performance(성능) 카테고리의 경우 단순히 소스코드 기반의 정적 분석 외에도, 구글 PageSpeed Insights의 **Real-world Core Web Vitals (CWV)** 점수를 50:50으로 혼합(Blend)하여 산출합니다.
* **주의사항**: 추후 전체 합산 점수(`Overall Score`)의 가중치(현재 Performance 28%, Security 25% 등)를 변경할 때는 각 카테고리의 합이 **반드시 100%**가 되도록 맞추어야만 정확한 만점(100점) 기준이 유지됩니다.
* **우선순위**: CWV 데이터(`performanceData`)가 없을 경우에는 정적 분석 점수만 100% 비중으로 계산하도록 예외 처리가 되어 있습니다.

## 5. 안티봇(Anti-Bot) 방화벽 및 프록시 폴백(Fallback)
대상 도메인이 Cloudflare 403, 503 등으로 스캐너를 차단할 경우, 백엔드는 자동으로 `D1_PROXY_URL` (Cloudflare Worker Proxy)로 우회 스캔을 시도하도록 설계되어 있습니다.
* 스캐너 봇 차단을 탐지하면 에러를 띄우지 않고, Worker Proxy를 통해 HTML 텍스트를 우회하여 긁어온 뒤 정상 데이터처럼 처리합니다. 이 우회 로직(`fetchWithFallback`)이 망가지면 인증이 필요한 특정 엔터프라이즈 사이트 스캔 시 통신 에러가 발생하게 됩니다.
