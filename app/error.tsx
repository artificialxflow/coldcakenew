'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-yellow-50 to-amber-50 p-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">خطا</h1>
        <p className="text-gray-700">{error.message || 'خطای غیرمنتظره رخ داد'}</p>
        {error.digest && <p className="text-sm text-gray-500">کد خطا: {error.digest}</p>}
        <button
          onClick={reset}
          className="w-full rounded-full bg-yellow-600 text-white py-2.5 font-semibold hover:bg-yellow-700"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
