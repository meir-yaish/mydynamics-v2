'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { Role } from '@/generated/prisma/client'
import { can } from '@/lib/rbac'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'דף הבית', icon: LayoutDashboard },
  { href: 'https://terminal3-scheduler-nine.vercel.app', label: 'לוח זמנים — טרמינל 3', icon: CalendarRange, external: true },
  { href: 'https://schedule-studio-three.vercel.app', label: 'לוח זמנים — סטודיו', icon: FilePlus, external: true },
  { href: 'https://equipment-advisor.vercel.app', label: 'ציוד הרמה', icon: Construction, external: true },
  { href: 'https://buyout-tool.vercel.app', label: 'תמכור', icon: Receipt, external: true },
  { href: '/meetings', label: 'סיכום ישיבות', icon: Users },
  { href: 'https://koreh-sd.vercel.app', label: 'שרטוטים', icon: FileImage, external: true },
  { href: '/procurement', label: 'חיפוש רכש', icon: Search },
  { href: '/supply-chain', label: 'שרשרת הספקה', icon: Truck },
]

export default function Sidebar({
  userName,
  userRole,
}: {
  userName: string
  userRole: Role
}) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed top-0 bottom-0 right-0 flex flex-col gap-1 overflow-y-auto z-20"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        borderLeft: '1px solid var(--border)',
        padding: '1rem',
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl mb-3"
        style={{
          background: '#171b32',
          padding: '0.75rem',
        }}
      >
        <span className="text-white font-bold text-lg tracking-wide">
          MY-Dynamics
        </span>
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, external }) => {
          const active =
            !external && (href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href))
          const linkStyle = {
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            color: active ? 'var(--primary-foreground)' : 'var(--ink)',
            background: active ? 'var(--primary)' : 'transparent',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none' as const,
          }
          if (external) {
            return (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors"
                style={linkStyle}
              >
                <Icon size={18} />
                {label}
              </a>
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
            color: pathname.startsWith('/admin')
              ? 'var(--primary-foreground)'
              : 'var(--muted)',
            background: pathname.startsWith('/admin')
              ? 'var(--primary)'
              : 'transparent',
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
            {userRole === 'ADMIN'
              ? 'מנהל'
              : userRole === 'MANAGER'
                ? 'מנהל פרויקט'
                : userRole === 'SITE_MANAGER'
                  ? 'מנהל אתר'
                  : userRole === 'WORKER'
                    ? 'עובד'
                    : 'צופה'}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          title="התנתק"
          aria-label="התנתק מהמערכת"
        >
          <LogOut size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </nav>
  )
}
