// src/components/layout/NavbarUser.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';
import { useCurrentTime } from '@/hooks/useCurrentTime' 

export default function NavbarUser({ initialUser }: { initialUser: any }) {
  // Zustand 스토어에서 상태와 액션을 가져옵니다.
  const { user, setUser } = useUserStore();
  const { timeString, amPm } = useCurrentTime(); // [핵심] 한 줄로 호출

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
    <div className="flex items-center space-x-4">
      <div className="text-right">
        {/* 중앙 상태(user)에서 이름을 실시간으로 가져옵니다. */}
        <p className="text-sm font-bold text-slate-700">
          {user.name}님
        </p>
        <p className="text-[10px] text-blue-500 font-mono uppercase tracking-wider">
          {user.role}
        </p>
        <p className="text-xs text-slate-500">
          현재 시간: {amPm} {timeString}
        </p>
      </div>
      <LogoutButton />
    </div>
  );
}