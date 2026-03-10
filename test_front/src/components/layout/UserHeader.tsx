// src/components/layout/UserHeader.tsx
'use client';

import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import Link from 'next/link';
import LogoutButton from '../LogoutButton';

export default function UserHeader({ initialUser }: { initialUser: any }) {
  const { user, setUser } = useUserStore();

  // 최초 렌더링 시 서버에서 준 데이터를 스토어에 주입 (Vue의 created/mounted 역할)
  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser, setUser]);

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">{user.name}님</p>
            <p className="text-[10px] text-blue-500 font-mono uppercase tracking-wider">{user.role}</p>
          </div>
          <LogoutButton />
        </>
      ) : (
        <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">
          Login
        </Link>
      )}
    </div>
  );
}