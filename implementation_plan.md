# 미인증 사용자 접근 제한 및 로그인 리다이렉트 구현 계획

로그인하지 않은 사용자가 보호된 페이지에 접근할 때 403 에러 페이지 대신 로그인 페이지로 자동 리다이렉트되도록 개선합니다.

## 제안된 변경 사항

### 1. Next.js Middleware (`middleware.ts`)
- `/(protected)` 그룹 내의 모든 페이지(실제 URL 경로 기반)에 대해 인증 체크를 강화합니다.
- `/board/*`, `/members/*`, `/aop-test/*`, `/batch/*`, `/monitor/*`, `/apps/*`, `/flux-test/*` 등을 포함합니다.
- 토큰 부재 시 `/login?message=unauthorized`로 리다이렉트합니다.

### 2. API 클라이언트 (`src/api/client.ts`)
- 401/403 에러 발생 시 현재의 `alert()` 대신 Toast 알림을 표시하도록 수정합니다.
- 로그아웃 처리(`clearAuthSession()`) 후 로그인 페이지로 이동시킵니다.

### 3. UI/UX 개선 (Toast)
- `SimpleToast` 컴포넌트와 이를 관리할 `ToastContext`를 생성합니다.
- `app/layout.tsx`에 `ToastProvider`를 추가하여 전역에서 접근 가능하게 합니다.
- 로그인 페이지 진입 시 쿼리 스트링(`message=unauthorized`)이 있으면 "로그인이 필요한 서비스입니다." 알림을 띄웁니다.

## 검증 계획

### 자동화 테스트 (Puppeteer)
- 브라우저를 사용하여 쿠키가 없는 상태에서 `/board` 접근 시 `/login`으로 리다이렉트되는지 확인합니다.
- API 호출 시 403 에러를 모방(Mock 또는 실제 서버 활용)하여 Toast 메시지가 노출되는지 확인합니다.

### 수동 검증
- 시크릿 창에서 보호된 경로 접속 시 동작 확인.
