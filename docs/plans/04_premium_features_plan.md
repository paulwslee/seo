# Phase 4-3: 프리미엄 킬러 피처 (Premium Killer Features) 기획 및 추적

이 문서는 SEO Compass의 핵심 유료 결제 전환을 유도할 '프리미엄 기능'의 개발 진행 상황을 추적하기 위해 작성되었습니다.

---

## 1. 진행 상황 추적 (Progress Tracker)

### A. Stripe 결제 연동 (MVP) - ✅ 완료
- [x] Database Schema 확장 (plan, stripe_customer_id 등)
- [x] Stripe 모듈 설치 및 API 라우트 (`/checkout`, `/webhook`) 구축
- [x] Dashboard에 업그레이드 UI 및 결제 검증 로직 추가
- [x] 무료 유저 제한(3개 도메인) 로직 적용 완료 (`api/scan`)

### B. 경쟁사 스파이 모드 (Competitor X-Ray) - ⏳ 대기 중 (Next Step)
내 사이트와 경쟁사 사이트를 한눈에 비교 분석하는 기능입니다.
- [ ] 입력한 URL의 페이지 콘텐츠를 분석하여 **AI가 사이트의 성격(Niche/Industry)을 자동 파악**
- [ ] 파악된 성격을 바탕으로 AI가 **"유사한 경쟁사 사이트 3곳과 비교 분석을 진행하시겠습니까?"** 라고 먼저 제안 (대표님 아이디어 🌟)
- [ ] 승인 시 4개의 사이트를 병렬 스캔하여 H1, 속도, 백링크 등 핵심 지표 1:1 비교
- [ ] "경쟁사가 구글 1위를 차지한 이유" 분석 리포트 생성

### C. 주간 정기 자동 스캔 (Weekly Set & Forget) - ⏳ 대기 중
매주 자동으로 스캔을 진행하여 이메일로 PDF 보고서를 보내는 해지 방어(Retention) 기능입니다.
- [ ] 대시보드 내 "주간 리포트 구독 스위치 (ON/OFF)" UI 추가
- [ ] Cloudflare Cron Triggers 또는 Upstash QStash를 이용한 스케줄러 세팅
- [ ] 스케줄러 작동 시 프리미엄 유저들의 URL을 백그라운드 스캔
- [ ] Resend API를 연동하여 결과 PDF 이메일 발송

---

## 2. 개발자 메모
대표님께서 제안하신 **"AI가 사이트 성격을 파악하고 먼저 경쟁사를 제안하는 기능"**은 사용자 경험(UX) 측면에서 엄청난 와우 포인트(Wow-point)가 될 것입니다. 
이 기능을 최우선으로 개발하기 위해, 프론트엔드의 스캔 흐름(Scan Flow)을 1단계(내 사이트 분석)와 2단계(경쟁사 제안 및 심층 비교)로 나누어 설계할 예정입니다.
