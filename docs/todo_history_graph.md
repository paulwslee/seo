# SEO 스코어 히스토리 및 트렌드 그래프 기획안 (TODO)

현재 시스템은 도메인 스캔 결과를 `scan_results` 테이블에 JSON 형태로 전체 저장하고 있습니다. 
나중에 Dashboard에서 특정 도메인을 눌렀을 때 **"시간의 흐름에 따라 점수가 어떻게 좋아지고 나빠졌는지"**를 보여주는 꺾은선 그래프(Trend Graph)를 구현하기 위한 작업 계획입니다.

## 1. 데이터베이스 스키마 변경 (`src/lib/db/schema.ts`)
그래프를 그리기 위해 방대한 JSON을 매번 파싱하는 것은 성능에 좋지 않으므로, 빠른 조회를 위해 `score` 컬럼을 명시적으로 추가해야 합니다.

```typescript
// src/lib/db/schema.ts 의 scanResults 테이블 수정
export const scanResults = sqliteTable("scan_results", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  url: text("url").notNull(),
  
  // 새로 추가할 컬럼 (빠른 차트 렌더링용)
  score: integer("score"), 
  
  basicSeoJson: text("basic_seo_json").notNull(), 
  canonicalRiskJson: text("canonical_risk_json").notNull(),
  
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

- 변경 후 마이그레이션 실행: `npm run db:push` 또는 `npx drizzle-kit push:sqlite`

## 2. API 서버 로직 개선 (`src/app/api/scan/route.ts`)
스캔이 완료되어 DB에 `insert` 할 때, 계산된 총점(`results.score`)을 새로 만든 `score` 컬럼에 함께 저장하도록 로직을 수정해야 합니다.

## 3. 프론트엔드: 대시보드 그래프 UI 구현 (`src/app/[locale]/dashboard/...`)
- 해당 유저의 특정 `projectId` (또는 `url`)에 해당하는 `scanResults`를 `createdAt` 오름차순으로 조회합니다.
- `recharts` 또는 `chart.js` 라이브러리를 사용하여 날짜별 `score`를 선 그래프(Line Chart)로 시각화합니다.
- (선택) 미니 스파크라인(Sparkline)을 프로젝트 리스트 뷰에 작게 배치하여 썸네일처럼 트렌드를 한눈에 보여주는 것도 좋은 UX입니다.
