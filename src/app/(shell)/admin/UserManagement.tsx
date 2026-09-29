'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import type { Role } from '@/generated/prisma/client'

type UserRow = {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'מנהל',
  MANAGER: 'מנהל פרויקט',
  SITE_MANAGER: 'מנהל אתר',
  WORKER: 'עובד',
  VIEWER: 'צופה',
}

export default function UserManagement({
  initialUsers,
}: {
  initialUsers: UserRow[]
}) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        name: form.get('name'),
        password: form.get('password'),
        role: form.get('role'),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'שגיאה')
      setSaving(false)
      return
    }

    const user = await res.json()
    setUsers((prev) => [user, ...prev])
    setShowForm(false)
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">ניהול משתמשים</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus size={16} />
          הוסף משתמש
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div>
            <label>שם</label>
            <input name="name" required className="mt-1" />
          </div>
          <div>
            <label>אימייל</label>
            <input name="email" type="email" required dir="ltr" className="mt-1" />
          </div>
          <div>
            <label>סיסמה</label>
            <input name="password" type="password" required dir="ltr" minLength={8} className="mt-1" />
          </div>
          <div>
            <label>תפקיד</label>
            <select name="role" required className="mt-1">
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="sm:col-span-2 text-sm font-bold" style={{ color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th className="text-right p-3 font-bold">שם</th>
              <th className="text-right p-3 font-bold">אימייל</th>
              <th className="text-right p-3 font-bold">תפקיד</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3" dir="ltr" style={{ color: 'var(--muted)' }}>
                  {u.email}
                </td>
                <td className="p-3">
                  <span className="badge badge-blue">{ROLE_LABELS[u.role]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
