'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  CalendarRange,
  FilePlus,
  Construction,
  Receipt,
  Users,
  FileImage,
  Search,
  Truck,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { Role } from '@/generated/prisma/client'
import { can } from '@/lib/rbac'

const NAV_ITEMS = [
  { href: '/dashboard',      label: 'דף הבית',               icon: LayoutDashboard },
  { href: '/schedule',       label: 'לוח זמנים — טרמינל 3', icon: CalendarRange },
  { href: '#',               label: 'לוח זמנים — סטודיו',   icon: FilePlus,    soon: true },
  { href: '/equipment',      label: 'ציוד הרמה',             icon: Construction },
  { href: '/buyout',         label: 'תמכור',                  icon: Receipt },
  { href: '/meetings',       label: 'סיכום ישיבות',          icon: Users },
  { href: '/drawings',       label: 'שרטוטים',               icon: FileImage },
  { href: '/procurement',    label: 'חיפוש רכש',             icon: Search },
  { href: '/supply-chain',   label: 'שרשרת הספקה',           icon: Truck },
]

const SIDEBAR_WIDTH = 250

export default function Sidebar({
  userName,
  userRole,
}: {
  userName: string
  userRole: Role
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open')
    if (saved === 'false') setOpen(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar-open', String(open))
    document.documentElement.style.setProperty(
      '--sidebar-width',
      open ? `${SIDEBAR_WIDTH}px` : '0px'
    )
  }, [open])

  return (
    <>
      {/* Toggle tab — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        title={open ? 'סגור תפריט' : 'פתח תפריט'}
        style={{
          position: 'fixed',
          top: '50%',
          right: open ? SIDEBAR_WIDTH : 0,
          transform: 'translateY(-50%)',
          zIndex: 30,
          background: '#171b32',
          color: 'white',
          border: 'none',
          borderRadius: '6px 0 0 6px',
          width: 20,
          height: 48,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.25s ease',
          padding: 0,
        }}
      >
        {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Sidebar panel */}
      <nav
        className="fixed top-0 bottom-0 right-0 flex flex-col gap-1 overflow-y-auto z-20"
        style={{
          width: SIDEBAR_WIDTH,
          background: 'var(--sidebar-bg)',
          borderLeft: '1px solid var(--border)',
          padding: '1rem',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <div
          className="flex items-center justify-center rounded-xl mb-3"
          style={{ background: '#171b32', padding: '0.75rem' }}
        >
          <span className="text-white font-bold text-lg tracking-wide">MY-Dynamics</span>
        </div>

        <div className="flex flex-col gap-0.5 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, soon }) => {
            const active = href !== '#' && (
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href)
            )
            const linkStyle = {
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              color: soon ? 'var(--muted)' : active ? 'var(--primary-foreground)' : 'var(--ink)',
              background: active ? 'var(--primary)' : 'transparent',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none' as const,
              opacity: soon ? 0.5 : 1,
              cursor: soon ? 'default' : 'pointer',
            }
            if (soon) {
              return (
                <span key={label} className="flex items-center gap-2.5" style={linkStyle}>
                  <Icon size={18} />
                  {label}
                  <span style={{ fontSize: 9, background: '#e5e7eb', color: '#6b7280', borderRadius: 4, padding: '1px 4px', marginRight: 'auto' }}>בהכנה</span>
                </span>
              )
            }
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 no-underline transition-colors"
                style={linkStyle}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>

        {can(userRole, 'manage_users') && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 no-underline transition-colors mt-2"
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '8px',
              color: pathname.startsWith('/admin') ? 'var(--primary-foreground)' : 'var(--muted)',
              background: pathname.startsWith('/admin') ? 'var(--primary)' : 'transparent',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            <Settings size={18} />
            ניהול מערכת
          </Link>
        )}

        <div
          className="flex items-center gap-2 mt-3 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{userName}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              {userRole === 'ADMIN' ? 'מנהל' :
               userRole === 'MANAGER' ? 'מנהל פרויקט' :
               userRole === 'SITE_MANAGER' ? 'מנהל אתר' :
               userRole === 'WORKER' ? 'עובד' : 'צופה'}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            title="התנתק"
          >
            <LogOut size={16} style={{ color: 'var(--muted)' }} />
          </button>
        </div>
      </nav>
    </>
  )
}
