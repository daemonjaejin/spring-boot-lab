'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/auth/AuthContext';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, role, username, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const showBatchMenu = role !== 'TESTER';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="brand">Member Console</h1>
          <nav className="nav-links">
            <Link className={isActive('/members')} href="/members">
              Members
            </Link>
            <Link className={isActive('/apps')} href="/apps">
              Apps
            </Link>
            {showBatchMenu && (
              <Link className={isActive('/batch')} href="/batch">
                Batch
              </Link>
            )}
            <Link className={isActive('/async-test')} href="/async-test">
              Async Test
            </Link>
          </nav>
        </div>
        <div className="topbar-right">
          <span className="identity">
            {username ?? 'unknown'} ({role ?? 'UNKNOWN'})
          </span>
          <button className="btn secondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}
