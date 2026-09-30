import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm fade-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(30, 35, 64, 0.08)',
        }}
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center rounded-xl mb-3"
            style={{
              background: '#171b32',
              padding: '0.6rem 1.5rem',
            }}
          >
            <span className="text-white font-bold text-xl tracking-wide">
              MY-Dynamics
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            התחבר למערכת ניהול הפרויקטים
          </p>
        </div>

        <Suspense fallback={<div className="text-center p-4">טוען...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
