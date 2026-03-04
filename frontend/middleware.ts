import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // /(protected) 경로 하위의 모든 페이지에 대해 인증 체크
  // (app-router 구조에서 (protected) 폴더는 URL 경로에 포함되지 않으므로, 
  // 실제 페이지 경로 패턴을 매칭하거나 전체 경로에서 공개 경로를 제외하는 방식을 사용합니다.)
  // 여기서는 명확하게 /board, /members 등 보호가 필요한 경로들을 대상으로 합니다.
  
  const protectedPaths = ['/board', '/members', '/aop-test', '/batch', '/monitor'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // redirect 시 원래 가려던 페이지 정보를 쿼리 스트링으로 전달할 수도 있습니다.
    // url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/board/:path*',
    '/members/:path*',
    '/aop-test/:path*',
    '/batch/:path*',
    '/monitor/:path*',
  ],
};
