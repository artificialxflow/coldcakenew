'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication - this should be handled by middleware
    // For now, just redirect to orders
    router.push('/store/account/orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">حساب کاربری</h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/store/account/orders">
              <div className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <h2 className="text-xl font-semibold mb-2">سفارش‌های من</h2>
                <p className="text-gray-600">مشاهده تاریخچه سفارش‌ها</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
