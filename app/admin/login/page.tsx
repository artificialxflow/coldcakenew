'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ورود');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای ناشناخته');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 p-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-right">
          <h1 className="text-2xl font-bold text-gray-800">ورود به پنل ادمین</h1>
          <p className="text-gray-600 text-sm">نام کاربری و رمز عبور خود را وارد کنید.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-gray-700">نام کاربری</label>
            <input
              type="text"
              dir="ltr"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-gray-700">رمز عبور</label>
            <input
              type="password"
              dir="ltr"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-yellow-600 text-white py-2.5 font-semibold hover:bg-yellow-700 disabled:opacity-60"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ورود با موبایل:{' '}
          <Link href="/auth/login" className="text-yellow-600 hover:underline">
            ورود با کد پیامک
          </Link>
        </p>
      </div>
    </main>
  );
}
