// src/components/layout/MainLayout.tsx
'use client';

import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import NavbarUser from '@/components/layout/NavbarUser';

export default function MainLayout({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode; 
  initialUser: any;
}) {
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* 1. 사이드바: 유저 정보가 있을 때만 렌더링 */}
      {user && (
        <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
          <div className="p-6 text-xl font-bold text-white border-b border-slate-800 tracking-tight">
            ANTIGRAVITY
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition">
              <span>대시보드</span>
            </Link>
            <Link href="/member" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-blue-400 hover:text-white transition">
              <span>회원 관리</span>
            </Link>
          </nav>
        </aside>
      )}

      {/* 2. 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm font-medium text-slate-500">
            Home / <span className="text-slate-900">Management</span>
          </div>
          
          {/* 중앙 집중식 유저 정보 헤더 */}
          <NavbarUser initialUser={initialUser} />
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}