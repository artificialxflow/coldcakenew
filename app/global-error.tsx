'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial' }}>
          <h1>خطای سرور</h1>
          <p>{error.message || 'خطای غیرمنتظره رخ داد'}</p>
          {error.digest && <p style={{ fontSize: '0.9em', color: '#666' }}>کد خطا: {error.digest}</p>}
          <button
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
