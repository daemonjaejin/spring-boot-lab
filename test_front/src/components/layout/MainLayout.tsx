// src/components/layout/MainLayout.tsx
'use client';

import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import NavbarUser from '@/components/layout/NavbarUser';
import { useTheme } from '@/context/ThemeContext';

export default function MainLayout({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: any;
}) {
  const user = useUserStore((state) => state.user);
  const { isDarkMode } = useTheme();

  return (
    // 🚩 최상단 div: bg-white를 지우고 isDarkMode에 따라 배경색을 완전히 갈아끼웁니다.
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex h-screen w-full overflow-hidden">
        
        {/* 1. 사이드바 */}
        {user && (
          <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800">
            <div className="p-6 text-xl font-bold text-white border-b border-slate-800 tracking-tight">
              ANTIGRAVITY
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition">
                <span>대시보드</span>
              </Link>
              <Link href="/member" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-blue-400">
                <span>회원 관리</span>
              </Link>
            </nav>
          </aside>
        )}

        {/* 2. 메인 영역 */}
        {/* 🚩 여기서 bg-white를 제거하고 부모의 색상을 투과(bg-transparent)시킵니다. */}
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent"> 
          
          {/* 🚩 헤더: bg-white 대신 테마에 따른 조건부 클래스 적용 */}
          <header className={`h-16 border-b flex items-center justify-between px-8 shadow-sm transition-colors ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Home / <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Management</span>
            </div>
            <NavbarUser initialUser={initialUser} />
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}