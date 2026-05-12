# SEO Compass - Future Personalization & Settings Plan

이 문서는 사용자의 편의성과 서비스의 비즈니스 가치를 높이기 위해 추후(Phase 6+) 도입될 **개인화(Personalization) 및 설정 기능**에 대한 기획안입니다. 현재 Dashboard의 `Profile & Settings` 메뉴 하단에 "Coming Soon"으로 마크업된 기능들의 구체적인 청사진을 담고 있습니다.

## 1. Notification Schedule (알림 시간 설정)
* **목표:** 사용자가 원하는 시간에 스캔 결과 및 웹사이트 상태 리포트를 받아볼 수 있도록 하여 잔존율(Retention)을 높입니다.
* **주요 기능:**
  * **수신 빈도 설정:** 즉시(스캔 완료 직후), 일간 요약(Daily), 주간 요약(Weekly) 중 선택.
  * **수신 시간 및 타임존:** 매일 오전 9시 등 유저가 가장 활동하기 좋은 로컬 타임존 기반 시간대 설정.
  * **수신 채널:** 기본 이메일 수신 외에도 추후 Slack, Discord 웹훅 연동 지원.

## 2. Automated SEO Reports (자동 SEO 보고서 생성)
* **목표:** 프리미엄 유저(B2B, 에이전시 등)가 자신의 클라이언트나 내부 팀에게 공유할 수 있는 깔끔한 문서를 자동 생성합니다.
* **주요 기능:**
  * **정기 보고서 자동 발송:** 스캔 히스토리를 바탕으로 전주 대비 점수 변화, 해결된 문제, 새로 발견된 문제를 요약한 PDF/HTML 보고서 발송.
  * **수신자 다중 지정:** 유저 본인 외에도 `developer@mycompany.com`, `marketing@mycompany.com` 등 팀원 이메일을 추가하여 동시 발송.
  * **화이트 라벨링 (White-labeling):** (Pro 티어 이상) 보고서 상단의 SEO Compass 로고를 자사(에이전시) 로고로 교체할 수 있는 기능.

## 3. Custom Templates & Scoring (커스텀 템플릿 및 점수 가중치)
* **목표:** 획일화된 SEO 기준이 아닌, 유저의 비즈니스 특성에 맞춘 개인화된 AI 분석 및 점수 측정 방식을 제공합니다.
* **주요 기능:**
  * **리스크 가중치(Weight) 조정:** 비즈니스에 따라 특정 항목의 중요도를 직접 설정 (예: "우리 쇼핑몰은 이미지 Alt 태그가 생명이라 가중치를 높게", "Canonical 태그는 무시").
  * **AI 프롬프트 커스텀 가이드:** Gemini AI가 수정안을 제시할 때 적용할 페르소나 설정 (예: "전문적인 톤으로 작성", "클릭을 유도하는 자극적인 마케팅 문구 스타일로 작성").
  * **브랜드 키워드 락(Lock):** `Title` 태그에 무조건 들어가야 하는 자사 브랜드명(예: "AppFactorys")을 등록해두면, AI가 텍스트를 최적화할 때 절대 해당 단어를 삭제하지 않도록 보호.

---

### 개발 마일스톤 (Next Steps for Implementation)
이 기능들을 구현하기 위해서는 사용자 설정(User Preferences)을 저장할 새로운 데이터베이스 스키마 확장이 필요합니다.

```typescript
// 추후 src/lib/db/schema.ts 에 추가될 테이블 스케치
export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  
  // Notification
  notifyFrequency: text("notify_frequency").default("weekly"), // immediate, daily, weekly, none
  notifyTime: text("notify_time").default("09:00"), // HH:MM
  notifyTimezone: text("notify_timezone").default("Asia/Seoul"),
  
  // Reports
  reportRecipients: text("report_recipients"), // JSON string array of emails
  customLogoUrl: text("custom_logo_url"),
  
  // Custom Templates
  aiPersona: text("ai_persona").default("professional"),
  brandKeywords: text("brand_keywords"), // Comma separated
  
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```
