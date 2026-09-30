import Link from 'next/link'

export default function NotFound() {
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
        <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--primary, #4f46e5)', margin: 0 }}>
          404
        </h1>
        <p style={{ color: 'var(--muted, #6b7280)', marginBottom: 16 }}>
          הדף לא נמצא
        </p>
        <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none' }}>
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
