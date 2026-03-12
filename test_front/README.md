# 📘 test_front — React + Next.js 기능 정리

> **Spring Boot 백엔드**와 연동되는 Next.js 15 프론트엔드 프로젝트의 주요 기능, 사용 이유, 설계 결정사항을 기록한 문서입니다.

---

## 목차

- [프로젝트 구조](#프로젝트-구조)
- [React 내장 훅 사용 정리](#react-내장-훅-사용-정리)
- [Next.js 내장 기능 사용 정리](#nextjs-내장-기능-사용-정리)
- [외부 라이브러리 (Zustand) 도입 배경](#외부-라이브러리-zustand-도입-배경)
- [다크모드 우선순위 충돌 해결 과정](#다크모드-우선순위-충돌-해결-과정)
- [API 클라이언트 설계](#api-클라이언트-설계)
- [인증 미들웨어 (middleware.ts)](#인증-미들웨어-middlewarets)

---

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── layout.tsx        # 루트 레이아웃 (서버 컴포넌트, 유저 데이터 SSR 패칭)
│   ├── page.tsx          # 홈 페이지
│   ├── login/            # 로그인 페이지
│   └── member/           # 회원 관련 페이지
├── context/
│   └── ThemeContext.tsx  # 전역 다크모드 상태 관리 (Context API)
├── hooks/
│   └── useCurrentTime.ts # 커스텀 훅 — 현재 시간 실시간 표시
├── lib/
│   └── apiClient.ts      # 공통 API 클라이언트 (fetch wrapper)
├── providers/
│   └── UserProvider.tsx  # 유저 정보 Context Provider
├── store/
│   └── useUserStore.ts   # Zustand 전역 유저 상태 스토어
└── middleware.ts          # JWT 인증 기반 라우트 보호
```

---

## React 내장 훅 사용 정리

### 1. `useState`

| 파일 | 사용 목적 |
|------|-----------|
| `ThemeContext.tsx` | `isDarkMode` 상태를 컴포넌트 레벨에서 관리 |
| `UserProvider.tsx` | `user` 상태를 Context 내에서 관리 |
| `useCurrentTime.ts` | 현재 시각(`now`) 상태를 1초마다 갱신 |

> **이유**: React에서 UI에 반영해야 하는 모든 동적 데이터는 `useState`로 관리해야 리렌더링이 발생합니다.

---

### 2. `useEffect`

| 파일 | 사용 목적 |
|------|-----------|
| `ThemeContext.tsx` | `isDarkMode` 값이 바뀔 때마다 `<html>` 태그에 `dark` 클래스를 직접 주입/제거 |
| `useCurrentTime.ts` | 컴포넌트 마운트 시 `setInterval` 타이머 시작, 언마운트 시 `clearInterval` 정리(Cleanup) |

**ThemeContext.tsx 예시:**
```tsx
useEffect(() => {
  const root = window.document.documentElement; // <html> 태그
  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}, [isDarkMode]); // isDarkMode 변화에만 반응
```

> **이유**: DOM 직접 조작, 타이머, 외부 API 호출처럼 **React 렌더링 사이클 바깥**의 작업은 `useEffect` 안에서만 처리해야 Side Effect가 안전하게 관리됩니다.

---

### 3. `useContext`

| 파일 | 사용 목적 |
|------|-----------|
| `ThemeContext.tsx` | `useTheme()` 커스텀 훅으로 래핑하여 `isDarkMode`, `toggleTheme` 전달 |
| `UserProvider.tsx` | `useUser()` 커스텀 훅으로 래핑하여 `user`, `updateUser` 전달 |

**사용 예시:**
```tsx
// 소비 컴포넌트에서
const { isDarkMode, toggleTheme } = useTheme();
```

> **이유**: `props drilling` 없이 컴포넌트 트리 전체에 공통 상태를 공유하기 위해 사용합니다. 특히 테마, 유저 정보처럼 **앱 전역에서 필요한 데이터**에 적합합니다.

---

### 4. `useMemo`

| 파일 | 사용 목적 |
|------|-----------|
| `useCurrentTime.ts` | `now` 상태 기반으로 오전/오후(`amPm`) 계산, `now`가 바뀔 때만 재계산 |

```ts
const amPm = useMemo(() => {
  return now.getHours() < 12 ? '오전' : '오후';
}, [now]);
```

> **이유**: 매 렌더링마다 불필요한 재계산을 방지하기 위해 사용합니다. 의존성(`now`)이 변경될 때만 결과를 다시 계산합니다.

---

### 5. `createContext`

| 파일 | 사용 목적 |
|------|-----------|
| `ThemeContext.tsx` | 다크모드 전역 상태 기지국 생성 |
| `UserProvider.tsx` | 유저 정보 전역 상태 기지국 생성 |

> **이유**: React에서 전역 상태를 공유하기 위한 기본 메커니즘입니다. Provider로 공급하고 Consumer(useContext)로 소비하는 패턴을 구현합니다.  
> → Zustand 도입 이후, 유저 상태는 Context에서 Zustand로 책임이 이전되었습니다.

---

## Next.js 내장 기능 사용 정리

### 1. `next/headers` (서버 사이드 쿠키 접근)

| 파일 | 사용 목적 |
|------|-----------|
| `app/layout.tsx` | 서버 컴포넌트에서 `accessToken` 쿠키를 읽어 유저 정보 SSR 패칭 |
| `lib/apiClient.ts` | 서버 환경 감지 시 동적으로 `next/headers` import하여 쿠키 추출 |

```ts
// 서버 환경에서만 동적으로 불러옴
const { cookies } = await import('next/headers');
const cookieStore = await cookies();
return cookieStore.get('accessToken')?.value;
```

> **이유**: `next/headers`는 서버 컴포넌트 전용입니다. 클라이언트 번들에 포함되면 에러가 발생하므로, 환경 분기(`typeof window === 'undefined'`)와 함께 동적 import를 사용합니다.

---

### 2. `export const dynamic = 'force-dynamic'`

| 파일 | 사용 목적 |
|------|-----------|
| `app/layout.tsx` | 매 요청마다 서버에서 유저 정보를 새로 가져오도록 강제 |

> **이유**: Next.js는 기본적으로 페이지를 정적으로 캐싱합니다. 로그인/로그아웃 상태처럼 **요청마다 달라지는 동적 데이터**가 포함된 레이아웃에는 반드시 `force-dynamic`을 선언해야 합니다.

---

### 3. `next/dynamic` (미사용 → 도입 검토 경위)

> **배경**: 클라이언트 컴포넌트(`'use client'`)가 서버 컴포넌트 안에 중첩될 때, SSR 단계에서 `window is not defined` 에러가 발생할 수 있습니다.  
> **해결 방식**: 이 문제가 예상되는 컴포넌트에 `next/dynamic`의 `{ ssr: false }` 옵션을 적용하여 클라이언트에서만 렌더링하도록 지연시킵니다.

```tsx
import dynamic from 'next/dynamic';
const ClientOnlyComponent = dynamic(() => import('./ClientComp'), { ssr: false });
```

---

### 4. Next.js Middleware (`middleware.ts`)

> **이유**: 페이지 컴포넌트가 렌더링되기 **전에** 요청을 가로채어 인증 토큰을 검사하고, 미인증 사용자를 로그인 페이지로 리다이렉트합니다. Java Spring Security의 Filter Chain과 동일한 역할입니다.

**핵심 기능:**
- `accessToken` 쿠키 존재 여부 확인
- JWT `exp` 만료 시간 파싱 및 자동 리다이렉트
- 만료된 토큰 쿠키 즉시 삭제
- `callbackUrl` 파라미터로 로그인 후 원래 경로 복귀 지원

---

## 외부 라이브러리 (Zustand) 도입 배경

### 문제 상황

| 상황 | 문제 |
|------|------|
| `UserProvider.tsx` (Context API 기반) | Provider가 중첩되고, 상태 변경 시 트리 전체 리렌더링 발생 |
| 로그인/로그아웃 전환 | Context만으로는 전역 상태 초기화 로직이 산발적으로 흩어짐 |
| 컴포넌트 간 유저 상태 공유 | `props drilling` 또는 Context 재사용 복잡성 증가 |

### Zustand 선택 이유

- **보일러플레이트 최소화**: Redux 대비 매우 적은 설정 코드
- **선택적 구독**: 필요한 상태만 구독하여 불필요한 리렌더링 방지
- **Immer 없이 불변성 관리**: `set()` 함수로 간결한 상태 업데이트
- **Provider 불필요**: 최상위 컴포넌트 래핑 없이 어디서든 직접 접근 가능

### 현재 스토어 구조

```typescript
// src/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  user: any | null;
  setUser: (user: any | null) => void;
  clearUser: () => void; // 로그아웃 전용 초기화
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

**사용 패턴:**
```tsx
// 로그인 성공 후
const { setUser } = useUserStore();
setUser({ name: 'John', role: 'ADMIN' });

// 로그아웃 시
const { clearUser } = useUserStore();
clearUser();
```

---

## 다크모드 우선순위 충돌 해결 과정

### 문제 발생

Tailwind CSS의 `dark:` 유틸리티를 사용할 때, `dark` 클래스를 적용해도 다크모드 스타일이 반영되지 않는 문제가 발생했습니다.

### 원인 분석

| 원인 | 설명 |
|------|------|
| **클래스 적용 위치 불일치** | `dark` 클래스를 `<div>` 에 적용했으나, Tailwind는 `<html>` 태그에 `dark` 클래스가 있어야 동작함 |
| **CSS 우선순위 충돌** | 상위 div의 클래스보다 직접 작성한 CSS가 더 높은 우선순위를 가져 덮어쓰기 발생 |

### 해결 과정

**1단계 (잘못된 방법):** `ThemeProvider`의 래퍼 `<div>`에 `dark` 클래스 부여
```tsx
// ❌ 이렇게 하면 Tailwind dark: 유틸리티가 동작하지 않음
<div className={isDarkMode ? 'dark' : ''}>
  {children}
</div>
```

**2단계 (올바른 해결):** `useEffect`로 `<html>` 태그에 직접 `dark` 클래스 주입

```tsx
// ✅ 최종 해결 방법
useEffect(() => {
  const root = window.document.documentElement; // <html> 태그 직접 참조
  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}, [isDarkMode]);
```

**3단계 (tailwind.config 확인):** `darkMode: 'class'` 설정 필수

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 반드시 'class' 전략 명시
  // ...
}
```

### 결론

> Tailwind CSS의 `darkMode: 'class'` 전략은 **`<html>` 요소**에 `dark` 클래스가 있어야 하위 모든 `dark:` 유틸리티가 활성화됩니다.  
> React에서 DOM을 직접 조작하는 가장 안전한 방법은 `useEffect` 안에서 `document.documentElement.classList`를 변경하는 것입니다.

---

## API 클라이언트 설계

**파일:** `src/lib/apiClient.ts`

### 주요 기능

| 기능 | 구현 방식 |
|------|-----------|
| **환경 분기 토큰 추출** | `typeof window === 'undefined'`로 서버/클라이언트 구분, 각각 `next/headers` / `cookies-next` 사용 |
| **JWT 자동 주입** | 모든 요청 헤더에 `Authorization: Bearer {token}` 자동 첨부 |
| **Timeout 처리** | `AbortController`로 5초 타임아웃 구현 (Java의 `Future.get(timeout)` 유사) |
| **공통 에러 핸들링** | 400/401/403/404/500 상태 코드별 에러 메시지 분기 (Spring Boot의 `@ControllerAdvice` 역할) |
| **401 자동 리다이렉트** | 클라이언트 환경에서 401 발생 시 `/login` 페이지로 자동 이동 |

---

## 인증 미들웨어 (middleware.ts)

**Spring Security Filter Chain과의 비교:**

| Spring Security | Next.js Middleware |
|-----------------|--------------------|
| `OncePerRequestFilter` | `middleware(request)` 함수 |
| SecurityFilterChain `permitAll()` | `isPublicPath` 화이트리스트 |
| `UsernamePasswordAuthenticationFilter` | JWT 쿠키 파싱 및 만료 검증 |
| `AuthenticationEntryPoint` redirect | `NextResponse.redirect('/login')` |

**주요 구현 포인트:**
- JWT payload의 `exp` 필드를 `atob()`로 직접 파싱하여 만료 여부 판단
- 만료 시 `response.cookies.delete('accessToken')`으로 클라이언트 쿠키 즉시 삭제
- `callbackUrl` 인코딩으로 로그인 후 원래 페이지 복귀 UX 구현

---

## 기술 스택 요약

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 상태 관리 | Zustand (전역), Context API (테마/유저) |
| 스타일링 | Tailwind CSS (다크모드: `class` 전략) |
| HTTP 통신 | fetch API (커스텀 래퍼 `apiClient`) |
| 인증 | JWT (쿠키 저장, Middleware 검증) |
| 쿠키 처리 | `cookies-next` (클라이언트), `next/headers` (서버) |

---

*최종 업데이트: 2026-03-12*
