"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ارسال کد");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در تأیید کد");
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-yellow-50 to-amber-50 p-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-right">
          <h1 className="text-2xl font-bold text-gray-800">
            ورود / ثبت‌نام با شماره موبایل
          </h1>
          <p className="text-gray-600 text-sm">
            کد تأیید برای شما از طریق پیامک ارسال می‌شود.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2 text-right">
              <label className="block text-sm font-medium text-gray-700">
                شماره موبایل
              </label>
              <input
                type="tel"
                dir="ltr"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="مثلاً 09121234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-yellow-600 text-white py-2.5 font-semibold hover:bg-yellow-700 disabled:opacity-60"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2 text-right">
              <label className="block text-sm font-medium text-gray-700">
                کد تأیید ارسال‌شده
              </label>
              <input
                type="text"
                dir="ltr"
                maxLength={6}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-center tracking-[0.4em] text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-yellow-600 text-white py-2.5 font-semibold hover:bg-yellow-700 disabled:opacity-60"
            >
              {loading ? "در حال تأیید..." : "ورود به داشبورد"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full rounded-full border border-gray-200 text-gray-700 py-2 text-sm"
            >
              تغییر شماره موبایل
            </button>
          </form>
        )}
      </div>
    </main>
  );
}


