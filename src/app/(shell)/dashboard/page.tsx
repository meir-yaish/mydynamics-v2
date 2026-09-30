import { auth } from '@/lib/auth'
import { ExternalLink } from 'lucide-react'
import ModuleCards from './ModuleCards'

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

      <ModuleCards />
    </div>
  )
}
