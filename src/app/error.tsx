'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #f6f7fb)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
          שגיאה
        </h1>
        <p style={{ color: 'var(--muted, #6b7280)', marginBottom: 16 }}>
          משהו השתבש. נסה לרענן את הדף.
        </p>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.5rem' }}
        >
          נסה שוב
        </button>
      </div>
    </div>
  )
}
