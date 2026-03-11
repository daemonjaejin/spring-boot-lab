// middleware.ts 수정본
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import type { NextRequest } from 'next/request' // 구버전

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // [수정] 우리가 로그인 시 저장한 이름인 'accessToken'으로 변경!
  const token = request.cookies.get('accessToken')?.value;
  const { pathname, search } = request.nextUrl;

  // 1. 화이트리스트 (운영에서는 좀 더 엄격하게 관리)
  const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.');

  if (!token && !isPublicPath) {
    // [운영 디테일] 로그인 후 원래 보던 페이지로 돌려보내기 위해 경로 저장
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;

      if (isExpired && !isPublicPath) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken'); // 확실한 세션 정리
        return response;
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // 전역 감시
};