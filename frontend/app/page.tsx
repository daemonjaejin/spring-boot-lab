'use client';

import { useAuth } from '@/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/members');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return null;
}
