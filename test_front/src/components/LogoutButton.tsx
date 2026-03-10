// src/components/LogoutButton.tsx
'use client';

import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore'; // 스토어 가져오기

export default function LogoutButton() {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser); // 초기화 함수

  const handleLogout = () => {
    deleteCookie('accessToken', { path: '/' }); // 쿠키 삭제

    clearUser(); // 스토어 초기화
    
    // router.refresh();            // 서버 상태 갱신 (헤더 유저 정보 제거용)
    router.push('/login');       // 로그인 페이지로 이동
    
  };

  return (
    <button 
      onClick={handleLogout}
      className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 transition"
      title="Logout"
    >
      🚪
    </button>
  );
}