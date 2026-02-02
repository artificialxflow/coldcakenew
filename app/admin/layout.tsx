'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      setAllowed(true);
      return;
    }

    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          setAllowed(true);
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setChecking(false));
  }, [isLoginPage, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
