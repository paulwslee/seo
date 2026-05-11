# 작업 공간 변경 시 필수 체크리스트 (TODO_AFTER_GIT_PULL)

이 문서는 집(Home)과 사무실(Office) 등 **서로 다른 컴퓨터(작업 공간)를 오가며 개발할 때, 환경 설정 누락으로 인한 에러를 방지하기 위한 필수 가이드라인**입니다.

새로운 컴퓨터에서 코드를 `git pull`로 내려받은 직후, 개발 서버(`npm run dev`)를 켜기 전에 반드시 아래 순서대로 점검해 주세요.

---

## 🛑 필수 실행 체크리스트 (순서대로 진행)

### 1. 패키지 설치 최신화 (NPM Install)
다른 컴퓨터에서 새로운 라이브러리(NPM 패키지)를 설치했을 수 있습니다. 코드를 받자마자 무조건 한 번 실행해 줍니다.
```bash
npm install
```

### 2. 로컬 데이터베이스 뼈대 맞추기 (Drizzle & D1 Migration)
**[가장 많이 실수하는 부분]** 다른 컴퓨터에서 데이터베이스 테이블을 새로 만들었거나(예: `api_usage_logs`), 기존 컬럼을 변경했다면 이 컴퓨터의 로컬 DB도 뼈대를 맞춰주어야 합니다. 
(로그인이나 클라우드 연동 필요 없음, `--local` 플래그로 내 컴퓨터에만 즉시 적용됨)
```bash
npx wrangler d1 migrations apply seo-tools --local
```
*💡 터미널에서 "Your database may not be available..." 같은 질문이 나오면 엔터(`y`)를 누르시면 됩니다.*

### 3. 환경 변수 파일(`.env.local`) 확인
`.env.local` 파일은 보안상 Github에 올라가지 않습니다. 따라서 다른 컴퓨터에서 새로운 API 키(예: Gemini API Key, Auth.js Secret 등)를 발급받아 `.env.local`에 추가했다면, 현재 컴퓨터의 `.env.local` 파일에도 똑같이 복사해서 넣어주어야 합니다.
*   **체크포인트:** `GEMINI_API_KEY`, `AUTH_SECRET` 등이 잘 들어있는지 확인.

---

## 🛠 선택 사항 (문제가 생겼을 때만 실행)

### DB 테이블이 완전히 꼬였을 때 (초기화)
로컬에서 개발하다가 에러가 나서 DB가 완전히 꼬여버린 경우, 클라우드를 걱정할 필요 없이 내 컴퓨터의 로컬 DB만 삭제하고 백지에서 다시 시작할 수 있습니다.
```bash
# 윈도우 환경(PowerShell)의 경우 로컬 DB 삭제 명령어:
Remove-Item -Recurse -Force .wrangler\state\v3\d1

# 삭제 후 다시 마이그레이션 적용:
npx wrangler d1 migrations apply seo-tools --local
```

### 클라우드(실제 운영 서버)에 배포하고 싶을 때
로컬 개발을 끝내고 실제 웹사이트(Cloudflare)에 데이터베이스를 올리고 싶을 때만 로그인을 진행합니다.
```bash
npx wrangler login
```
이후 브라우저 창이 열리면 Cloudflare 계정으로 로그인한 뒤, 아래 명령어로 실제 운영 DB에 반영합니다.
```bash
npx wrangler d1 migrations apply seo-tools --remote
```
