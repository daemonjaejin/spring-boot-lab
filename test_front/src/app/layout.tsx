import { cookies } from 'next/headers';
import '@/app/globals.css'; 
import MainLayout from '@/components/layout/MainLayout'; // [변경] 절대 경로 적용
import { ThemeProvider } from '@/context/ThemeContext';

export const dynamic = 'force-dynamic';

async function getUserData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) return null;

    const data = await response.json();
    console.log("서버에서 받은 유저 정보:", data);

    return {
      name: data.username,
      role: data.role
    };
  } catch (error) {
    console.error("유저 정보 로드 실패:", error);
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const user = await getUserData(); // 서버에서 데이터 패칭
  console.log("RootLayout 렌더링 시작 === ", user);

  return (
    <html lang="ko">
      <body className="antialiased">
        {/* 모든 레이아웃 구조와 상태 감지는 MainLayout이 담당합니다 */}
        <ThemeProvider>
          <MainLayout initialUser={user}>
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}