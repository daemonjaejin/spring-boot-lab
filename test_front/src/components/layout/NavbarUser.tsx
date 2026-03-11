// src/components/layout/NavbarUser.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { useCurrentTime } from '@/hooks/useCurrentTime' 
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';

// [핵심] 클릭하기 전까지는 이 컴포넌트 코드는 브라우저에 존재하지 않습니다.
const ImageDownloader = dynamic(() => import('@/components/ImageDownloader'), {
  ssr: false, 
});

export default function NavbarUser({ initialUser }: { initialUser: any }) {
  // Zustand 스토어에서 상태와 액션을 가져옵니다.
  const { user, setUser } = useUserStore();
  const { timeString, amPm } = useCurrentTime(); // [핵심] 한 줄로 호출
  const [isDownloadStart, setIsDownloadStart] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme(); // 기지국에서 데이터 땡겨오기

  console.log(`initialUser : `, initialUser);

  // [중요] 서버 컴포넌트(Layout)에서 전달받은 초기 데이터를 스토어에 동기화합니다.
  useEffect(() => {
    if (initialUser && !user) {
      setUser(initialUser);
    }
  }, [initialUser, user, setUser]);

  // 유저 정보가 없으면 로그인 링크를, 있으면 유저 정보를 보여줍니다.
  if (!user) {
    return (
      <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">
        Login
      </Link>
    );
  }

  return (

    // [핵심] 부모 헤더 안에서 죽지 않도록 폭을 잡고 우측 정렬
    <div className="flex flex-col items-end gap-0.5 leading-tight">
      
      {/* 1. 이름 & 역할 */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
          {initialUser?.name}님
        </span>
        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">
          {initialUser?.role}
        </span>
      </div>

      {/* 2. 다크모드 & 다운로드 링크 (작게 한 줄로 배치 제안) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDownloadStart(true)}
          className="text-[10px] text-blue-500 hover:underline cursor-pointer"
        >
          장원영.png 다운로드
        </button>
        
        <button 
          onClick={toggleTheme}
          className={`text-[10px] px-2 py-0.5 rounded border ${
            isDarkMode ? 'border-yellow-500 text-yellow-500' : 'border-slate-300 text-slate-500'
          }`}
        >
          {isDarkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
      </div>

      {isDownloadStart && <ImageDownloader onComplete={() => setIsDownloadStart(false)} />}
    </div>
  );
}