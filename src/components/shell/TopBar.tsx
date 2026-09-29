'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'דף הבית',
  '/schedule': 'לוח זמנים',
  '/equipment': 'ציוד הרמה',
  '/buyout': 'תמכור',
  '/meetings': 'סיכום ישיבות',
  '/drawings': 'שרטוטים',
  '/procurement': 'חיפוש רכש',
  '/supply-chain': 'שרשרת הספקה',
  '/admin': 'ניהול מערכת',
}

export default function TopBar() {
  const pathname = usePathname()
  const match = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path),
  )
  const title = match?.[1] ?? ''

  return (
    <header
      className="topbar sticky top-0 z-10 flex items-center px-6"
      style={{
        height: 'var(--topbar-height)',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h1 className="text-lg font-bold m-0">{title}</h1>
    </header>
  )
}
