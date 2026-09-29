'use client'

import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })

    if (res?.error) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email">אימייל</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.co.il"
          dir="ltr"
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="password">סיסמה</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className="mt-1"
        />
      </div>

      {error && (
        <div
          className="text-center text-sm font-bold"
          style={{ color: 'var(--red)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full justify-center mt-2"
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'מתחבר...' : 'התחבר'}
      </button>
    </form>
  )
}
