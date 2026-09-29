import { auth } from '@/lib/auth'
import {
  CalendarRange,
  Construction,
  Receipt,
  Users,
  FileImage,
  Search,
  Truck,
} from 'lucide-react'
import Link from 'next/link'

const MODULES = [
  {
    href: '/schedule',
    label: 'לוח זמנים',
    desc: 'Gantt, תלויות, baselines, דוחות',
    icon: CalendarRange,
    color: 'var(--primary)',
  },
  {
    href: '/equipment',
    label: 'ציוד הרמה',
    desc: 'קטלוג, המלצות, הזמנות',
    icon: Construction,
    color: 'var(--accent)',
  },
  {
    href: '/buyout',
    label: 'תמכור',
    desc: 'הצעות מחיר, חבילות, ספקים',
    icon: Receipt,
    color: 'var(--purple)',
  },
  {
    href: '/meetings',
    label: 'סיכום ישיבות',
    desc: 'ישיבות צוות, החלטות, מעקב',
    icon: Users,
    color: 'var(--amber)',
  },
  {
    href: '/drawings',
    label: 'שרטוטים',
    desc: 'צפייה בשרטוטים וחזיתות',
    icon: FileImage,
    color: 'var(--green)',
  },
  {
    href: '/procurement',
    label: 'חיפוש רכש',
    desc: 'חיפוש בהצעות מחיר',
    icon: Search,
    color: 'var(--red)',
  },
  {
    href: '/supply-chain',
    label: 'שרשרת הספקה',
    desc: 'מעקב הזמנות ואספקה',
    icon: Truck,
    color: '#0d9488',
  },
]

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold m-0">
          שלום, {session?.user?.name}
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>
          ברוכים הבאים למערכת ניהול הפרויקטים
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(({ href, label, desc, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="card no-underline"
            style={{ padding: '1.25rem', display: 'block', color: 'inherit' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: 42,
                  height: 42,
                  background: `${color}15`,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <div className="font-bold">{label}</div>
                <div
                  className="text-sm mt-0.5"
                  style={{ color: 'var(--muted)' }}
                >
                  {desc}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
